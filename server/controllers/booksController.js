/**
 * Номын удирдлагын контроллер
 * Энэ файл нь номын өгөгдөлтэй харьцах үндсэн CRUD үйлдлүүдийг агуулна:
 *  - Номын жагсаалт авах (getAllBooks)
 *  - Нэг номын мэдээлэл авах (getBookById)
 *  - Шинэ ном нэмэх (createBook)
 *  - Номын мэдээлэл шинэчлэх (updateBook)
 *  - Ном устгах (deleteBook)
 */

import { pool } from '../db.js';

/**
 * @openapi
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Номын жагсаалт авах
 *     description: Бүх номыг авах. (Хэрэв query параметр хэрэгтэй бол энэ хэсэгт дурьдаарай)
 *     responses:
 *       200:
 *         description: Амжилттай. Номын жагсаалтыг буцаана.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Серверийн алдаа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * Номын жагсаалт авах функц
 * (одоогоор query param ашиглахгүй, зүгээр бүх номыг буцаана)
 */
export async function getAllBooks(req, res) {
  try {
    const query = 'SELECT * FROM books ORDER BY id ASC;';
    const { rows } = await pool.query(query);

    // books массив хэлбэрээр буцаана
    res.json({ books: rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


/**
 * @openapi
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Нэг номын мэдээлэл авах
 *     description: Тухайн ID-гаар номыг хайж олоод буцаана
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Номын ID
 *     responses:
 *       200:
 *         description: Амжилттай. ID тохирсон номыг буцаана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Ном олдсонгүй
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Серверийн алдаа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * Номын ID-аар мэдээлэл авах
 */
export async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM books WHERE id = $1';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting book by ID:', err);
    res.status(500).json({ error: err.message });
  }
}


/**
 * @openapi
 * /books:
 *   post:
 *     tags: [Books]
 *     summary: Шинэ ном нэмэх
 *     description: Өгөгдлийн санд шинэ ном бүртгэнэ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *           example:
 *             title: "Misery"
 *             author: "Stephen King"
 *             price: 9500.00
 *             category: "Horror"
 *             isbn: "978-1501143106"
 *             publish_date: "1987"
 *             publisher: "Scribner"
 *             language: "English"
 *             pages: 368
 *             format: "Paperback"
 *             description: "Misery is the terrifying story..."
 *             cover_image: "client/img/1.jpg"
 *             rating: 4.3
 *             reviews: 1200
 *             in_stock: true
 *     responses:
 *       201:
 *         description: Амжилттай үүсгэгдлээ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Буруу оролт
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Серверийн алдаа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * Шинэ ном үүсгэх (DB insert)
 */
export async function createBook(req, res) {
  try {
    const book = req.body;
    console.log('Received book data:', book);

    const query = `
      INSERT INTO books (
        title, author, price, category, isbn, publish_date, 
        publisher, language, pages, format, description, 
        cover_image, rating, reviews, in_stock
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      book.title,
      book.author,
      book.price,
      book.category,
      book.isbn,
      book.publish_date,
      book.publisher,
      book.language,
      book.pages,
      book.format,
      book.description,
      book.cover_image,
      book.rating,
      book.reviews,
      book.in_stock
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ 
      error: err.message || 'Server error',
      details: err.stack
    });
  }
}


/**
 * @openapi
 * /books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Номын мэдээлэл шинэчлэх
 *     description: Одоо байгаа номын ID-г ашиглан өгөгдлийг PUT хүсэлтээр шинэчилнэ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Шинэчлэх номын ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Амжилттай шинэчлэгдлээ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Ном олдсонгүй
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Серверийн алдаа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * Номын мэдээлэл шинэчлэх (DB update)
 */
export async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const book = req.body;

    const query = `
      UPDATE books
      SET
        title = $1, author = $2, price = $3, category = $4, isbn = $5,
        publish_date = $6, publisher = $7, language = $8, pages = $9, format = $10,
        description = $11, cover_image = $12, rating = $13, reviews = $14, in_stock = $15
      WHERE id = $16
      RETURNING *
    `;
    const values = [
      book.title,
      book.author,
      book.price,
      book.category,
      book.isbn,
      book.publish_date,
      book.publisher,
      book.language,
      book.pages,
      book.format,
      book.description,
      book.cover_image,
      book.rating,
      book.reviews,
      book.in_stock,
      id
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: err.message });
  }
}


/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Ном устгах
 *     description: ID ашиглан өгөгдлийн сангаас номыг устгана
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Устгах номын ID
 *     responses:
 *       200:
 *         description: Ном амжилттай устгагдлаа
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Book deleted successfully"
 *       404:
 *         description: Ном олдсонгүй
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Серверийн алдаа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * Ном устгах
 */
export async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: err.message });
  }
}
