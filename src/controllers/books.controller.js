

import { prisma } from "../db.js";

// 1. GET /books - Бүх номыг зохиогчтой нь авах
export async function list(req, res) {
  const books = await prisma.book.findMany({
    include: { author: true }
  });

  return res.status(200).json({
    count: books.length,
    data: books
  });
}

// 2. GET /books/search?q= - Ном хайх
export async function search(req, res) {
  const q = String(req.query.q || "");

  const books = await prisma.book.findMany({
    where: {
      title: {
        contains: q,
        mode: "insensitive"
      }
    },
    include: { author: true }
  });

  return res.status(200).json({
    count: books.length,
    data: books
  });
}

// 3. GET /books/:id - Нэг ном авах
export async function getOne(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID"
    });
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: { author: true }
  });

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(book);
}

// 4. POST /books - Шинэ ном нэмэх
export async function create(req, res) {
  const { title, price, authorId } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !Number.isInteger(price) ||
    !Number.isInteger(authorId) ||
    authorId <= 0
  ) {
    return res.status(400).json({
      message: "Valid title, price and authorId are required"
    });
  }

  try {
    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        price,
        authorId
      },
      include: { author: true }
    });

    return res.status(201).json(book);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Зохиолч олдсонгүй"
      });
    }

    throw error;
  }
}

// 5. PATCH /books/:id - Номын мэдээлэл өөрчлөх
export async function update(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID"
    });
  }

  const { title, price, isAvailable, authorId } = req.body;
  const data = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Invalid title"
      });
    }

    data.title = title.trim();
  }

  if (price !== undefined) {
    if (!Number.isInteger(price)) {
      return res.status(400).json({
        message: "Invalid price"
      });
    }

    data.price = price;
  }

  if (isAvailable !== undefined) {
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "Invalid isAvailable"
      });
    }

    data.isAvailable = isAvailable;
  }

  if (authorId !== undefined) {
    if (!Number.isInteger(authorId) || authorId <= 0) {
      return res.status(400).json({
        message: "Invalid authorId"
      });
    }

    data.authorId = authorId;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      message: "No valid fields to update"
    });
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data,
      include: { author: true }
    });

    return res.status(200).json(book);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Зохиолч олдсонгүй"
      });
    }

    throw error;
  }
}

// 6. DELETE /books/:id - Ном устгах
export async function remove(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID"
    });
  }

  try {
    await prisma.book.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    throw error;
  }
}
