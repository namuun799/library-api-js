import { Router } from "express";
import * as c from "../controllers/authors.controller.js";

const router = Router();

router.get("/", c.getAuthors);
router.get("/counts", c.getAuthorCounts);
router.get("/:id", c.getAuthor);
router.post("/", c.createAuthor);
router.get("/:id/books", c.getAuthorBooks);
router.post("/:id/books", c.addAuthorBook);
router.delete("/:id", c.deleteAuthor);
export default router;