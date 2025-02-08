import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Номын API Swagger тохиргоо
 * - /books, /books/:id CRUD замууд
 * - "books" ширээний багануудтай тохирсон Book схем
 * - Хэрэглэгчийн болон админы талд ашиглах REST үйлдлүүд
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Online Bookstore API',
    version: '1.0.0',
    description: 'CRUD operations on the "books" table for an online bookstore',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Хөгжүүлэлтийн сервер',
    },
  ],
  components: {
    schemas: {
      Book: {
        type: 'object',
        required: ['title', 'author', 'price', 'category', 'isbn'],
        properties: {
          id: { 
            type: 'integer', 
            description: 'SERIAL PRIMARY KEY (auto-incremented ID)' 
          },
          title: {
            type: 'string',
            description: 'NOT NULL, up to 255 chars',
          },
          author: {
            type: 'string',
            description: 'NOT NULL, up to 255 chars',
          },
          price: {
            type: 'number',
            format: 'float',
            description: 'NOT NULL, DECIMAL(10,2)',
          },
          category: {
            type: 'string',
            description: 'NOT NULL, up to 100 chars',
          },
          isbn: {
            type: 'string',
            description: 'NOT NULL, up to 20 chars',
          },
          publish_date: {
            type: 'string',
            description: 'VARCHAR(50), publication date or year',
          },
          publisher: {
            type: 'string',
            description: 'up to 255 chars',
          },
          language: {
            type: 'string',
            description: 'up to 50 chars',
          },
          pages: {
            type: 'integer',
            description: 'Number of pages',
          },
          format: {
            type: 'string',
            description: 'Paperback, Hardcover, etc. up to 50 chars',
          },
          description: {
            type: 'string',
            description: 'TEXT, longer description',
          },
          cover_image: {
            type: 'string',
            description: 'up to 255 chars; URL for a cover image',
          },
          rating: {
            type: 'number',
            format: 'float',
            description: 'DECIMAL(3,2); average rating from 0-5 range',
          },
          reviews: {
            type: 'integer',
            description: 'default 0; number of reviews',
          },
          in_stock: {
            type: 'boolean',
            description: 'default true; whether the book is currently in stock',
          },
        },
        example: {
          id: 1,
          title: 'Misery',
          author: 'Stephen King',
          price: 9500.0,
          category: 'Horror',
          isbn: '978-1501143106',
          publish_date: '1987',
          publisher: 'Scribner',
          language: 'English',
          pages: 368,
          format: 'Paperback',
          description: 'Misery is the terrifying story of novelist Paul Sheldon...',
          cover_image: 'client/img/1.jpg',
          rating: 4.3,
          reviews: 1200,
          in_stock: true,
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
        example: {
          error: 'Book not found',
        },
      },
    },
    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Not Found' },
          },
        },
      },
    },
  },
  paths: {
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'Get all books',
        description: 'Returns all books from the database.',
        responses: {
          200: {
            description: 'Successfully returned array of books',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Books'],
        summary: 'Add a new book',
        description: 'Inserts a new record into the "books" table',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Book' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created a new book successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          400: {
            description: 'Bad request or missing required fields',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Get a book by ID',
        description: 'Fetch a single book by its ID from the database.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Book ID',
          },
        ],
        responses: {
          200: {
            description: 'Successfully found the book',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Books'],
        summary: 'Update a book',
        description: 'Updates an existing book in the database by ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Book ID to update',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Book' },
            },
          },
        },
        responses: {
          200: {
            description: 'Successfully updated the book',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Books'],
        summary: 'Delete a book',
        description: 'Removes a book record from the database by ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Book ID to delete',
          },
        ],
        responses: {
          200: {
            description: 'Successfully deleted the book',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                  example: { message: 'Book deleted successfully' },
                },
              },
            },
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerDocs = swaggerJsDoc({
  definition: swaggerDefinition,
  // If you don't have JSDoc comments in routes, you can leave 'apis' as empty array
  apis: [],
});

// Additional UI options to customize Swagger
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bookstore API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showCommonExtensions: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
    tryItOutEnabled: true,
    persistAuthorization: true,
  },
};

export { swaggerDocs, swaggerUi, swaggerUiOptions };
