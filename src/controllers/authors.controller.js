
import { prisma } from "../db.js";

// ========================================
// 1. GET /authors
// Бүх зохиолчийг авах + нэрээр хайх
// SEMINAR 9: ?q=Сараа
// ========================================
export async function getAuthors(req, res) {
  try {
    const q = String(req.query.q || "").trim();

    const authors = await prisma.author.findMany({
      where: q
        ? {
            name: {
              contains: q,
              mode: "insensitive"
            }
          }
        : {},
      include: {
        _count: {
          select: { books: true }
        }
      }
    });

    return res.status(200).json(authors);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 2. GET /authors/:id
// Нэг зохиолчийн мэдээллийг авах
// ========================================
export async function getAuthor(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid author ID"
    });
  }

  const author = await prisma.author.findUnique({
    where: { id }
  });

  if (!author) {
    return res.status(404).json({
      message: "Зохиолч олдсонгүй"
    });
  }

  return res.status(200).json(author);
}

// ========================================
// 3. POST /authors
// Шинэ зохиолч нэмэх
// ========================================
export async function createAuthor(req, res) {
  const { name, email } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim()
  ) {
    return res.status(400).json({
      message: "Valid name and email are required"
    });
  }

  try {
    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        email: email.trim()
      }
    });

    return res.status(201).json(author);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    throw error;
  }
}

// ========================================
// 4. GET /authors/:id/books
// Тухайн зохиолчийн бүх номыг авах
// ========================================
export async function getAuthorBooks(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid author ID"
    });
  }

  const author = await prisma.author.findUnique({
    where: { id },
    include: { books: true }
  });

  if (!author) {
    return res.status(404).json({
      message: "Зохиолч олдсонгүй"
    });
  }

  return res.status(200).json(author.books);
}

// ========================================
// 5. POST /authors/:id/books
// Тухайн зохиолчид шинэ ном нэмэх
// ========================================
export async function addAuthorBook(req, res) {
  const authorId = Number(req.params.id);
  const { title, price } = req.body;

  if (!Number.isInteger(authorId) || authorId <= 0) {
    return res.status(400).json({
      message: "Invalid author ID"
    });
  }

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !Number.isInteger(price)
  ) {
    return res.status(400).json({
      message: "Valid title and price are required"
    });
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId }
  });

  if (!author) {
    return res.status(404).json({
      message: "Зохиолч олдсонгүй"
    });
  }

  const book = await prisma.book.create({
    data: {
      title: title.trim(),
      price,
      authorId
    }
  });

  return res.status(201).json(book);
}

// ========================================
// 6. DELETE /authors/:id
// Номтой зохиолчийг устгахгүй
// ========================================
export async function deleteAuthor(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid author ID"
    });
  }

  const author = await prisma.author.findUnique({
    where: { id },
    include: {
      _count: {
        select: { books: true }
      }
    }
  });

  if (!author) {
    return res.status(404).json({
      message: "Зохиолч олдсонгүй"
    });
  }

  if (author._count.books > 0) {
    return res.status(409).json({
      message: "Номтой зохиолчийг устгах боломжгүй"
    });
  }

  await prisma.author.delete({
    where: { id }
  });

  return res.status(204).end();
}

// ========================================
// 7. GET /authors/counts
// Зохиолч бүрийн номын тоог авах
// ========================================
export async function getAuthorCounts(req, res) {
  const authors = await prisma.author.findMany({
    include: {
      _count: {
        select: { books: true }
      }
    }
  });

  return res.status(200).json(authors);
}
