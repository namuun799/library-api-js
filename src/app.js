import express from "express";
import booksRouter from "./routes/books.router.js";
import { logger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(logger);

app.use("/books", booksRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
