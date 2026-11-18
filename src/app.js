
import "dotenv/config";
import express from "express";

import booksRouter from "./routes/books.router.js";
import usersRouter from "./routes/users.router.js";
import authorsRouter from "./routes/authors.router.js";

import { logger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// Семинар 11 — Swagger UI
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "node:fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(logger);

// Семинар 11 — OpenAPI YAML файлыг унших
const spec = YAML.parse(
  fs.readFileSync("./openapi.yaml", "utf8")
);

// Swagger UI хуудас
app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

// Өмнөх API routes
app.use("/books", booksRouter);
app.use("/users", usersRouter);
app.use("/authors", authorsRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
