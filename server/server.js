import { createApp } from './app.js';
import { config } from './config.js';
import { swaggerDocs, swaggerUi } from '../swaggerDocs.js';

const app = createApp();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(config.port, () => {
    console.log(`Server: http://localhost:${config.port}`);
    console.log(`API documentation: http://localhost:${config.port}/api-docs`);
});
