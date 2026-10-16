import {
  books,
  findBookById,
  addBook,
  updateBook,
  removeBook
} from "../data/books.js";

export function list(req, res) {
  res.json({
    count: books.length,//массив дотор хэдэн ном байгааг тоолно.
    data: books//бүх номын мэдээллийг буцаана.
  });
}

export function getOne(req, res) {
  const id = Number(req.params.id);
  const book = findBookById(id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(book);
}

export function create(req, res) {
  const { title, price } = req.body;//салгаж авна.

  if (!title) {//нэр
    return res.status(400).json({ message: "title is required" });
  }

  const book = addBook({ title, price });
  res.status(201).json(book);
}

export function update(req, res) {
  const id = Number(req.params.id);
  const updated = updateBook(id, req.body);

  if (!updated) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(updated);//ном олдоогүй эсэхийг шалгана.
}

export function remove(req, res) {
  const id = Number(req.params.id);
  const ok = removeBook(id);

  if (!ok) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.status(204).send();
}
