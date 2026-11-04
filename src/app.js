
import "dotenv/config";
import express from "express";
import booksRouter from "./routes/books.router.js";
import usersRouter from "./routes/users.router.js";
import { logger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import authorsRouter from "./routes/authors.router.js";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(logger);


app.use("/books", booksRouter);
app.use("/users", usersRouter);
app.use("/authors", authorsRouter);

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
