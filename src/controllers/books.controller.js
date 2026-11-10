
import { prisma } from "../db.js";

// ========================================
// SEMINAR 9 - НОМЫН ШҮҮЛТҮҮР
// ========================================

// 1. Шүүлтүүр болон хайлтын нөхцөл үүсгэх
function buildWhere(query) {
  const where = {};

  // Зохиолчийн ID-гаар шүүх
  if (query.authorId !== undefined) {
    const id = Number(query.authorId);

    if (
      query.authorId === "" ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw {
        status: 400,
        message: "authorId эерэг бүхэл тоо байх ёстой"
      };
    }

    where.authorId = id;
  }

  // Ном байгаа эсэхээр шүүх
  if (query.available !== undefined) {
    if (
      query.available !== "true" &&
      query.available !== "false"
    ) {
      throw {
        status: 400,
        message: "available нь true эсвэл false байх ёстой"
      };
    }

    where.isAvailable = query.available === "true";
  }

  // Номын нэрээр хайх
  if (query.q) {
    where.title = {
      contains: String(query.q),
      mode: "insensitive"
    };
  }

  // Зохиолчийн нэрээр хайх
  if (query.author) {
    where.author = {
      name: {
        contains: String(query.author),
        mode: "insensitive"
      }
    };
  }

  // Үнийн хүрээгээр шүүх
  const price = {};

  if (query.minPrice !== undefined) {
    const min = Number(query.minPrice);

    if (
      query.minPrice === "" ||
      !Number.isFinite(min) ||
      min < 0
    ) {
      throw {
        status: 400,
        message: "minPrice зөв тоо байх ёстой"
      };
    }

    price.gte = min;
  }

  if (query.maxPrice !== undefined) {
    const max = Number(query.maxPrice);

    if (
      query.maxPrice === "" ||
      !Number.isFinite(max) ||
      max < 0
    ) {
      throw {
        status: 400,
        message: "maxPrice зөв тоо байх ёстой"
      };
    }

    price.lte = max;
  }

  if (
    price.gte !== undefined &&
    price.lte !== undefined &&
    price.gte > price.lte
  ) {
    throw {
      status: 400,
      message: "minPrice нь maxPrice-аас их байж болохгүй"
    };
  }

  if (Object.keys(price).length > 0) {
    where.price = price;
  }

  // Бие даалт 1: ID жагсаалтаар шүүх
  // Жишээ: ?ids=1,3,5
  if (query.ids !== undefined) {
    const ids = String(query.ids)
      .split(",")
      .map(value => Number(value.trim()));

    if (
      !query.ids ||
      ids.some(id => !Number.isInteger(id) || id <= 0)
    ) {
      throw {
        status: 400,
        message: "ids нь 1,3,5 хэлбэртэй байх ёстой"
      };
    }

    where.id = { in: ids };
  }

  return where;
}

// 2. Эрэмбэлэх нөхцөл үүсгэх
function buildOrderBy(query) {
  const allowed = ["title", "price", "createdAt"];

  let sort = String(query.sort || "createdAt");
  let order = query.order === "asc" ? "asc" : "desc";

  // Бие даалт 2: Богино эрэмбэлэлт
  // ?sort=-price -> desc
  // ?sort=price -> asc
  if (sort.startsWith("-")) {
    sort = sort.slice(1);
    order = "desc";
  } else if (sort.startsWith("+")) {
    sort = sort.slice(1);
    order = "asc";
  } else if (
    query.sort !== undefined &&
    query.order === undefined
  ) {
    order = "asc";
  }

  // Зөвшөөрөөгүй талбар бол default
  if (!allowed.includes(sort)) {
    sort = "createdAt";
    order = "desc";
  }

  return { [sort]: order };
}

// ========================================
// 1. GET /books - Бүх ном, шүүлтүүр,
// хайлт болон эрэмбэлэлт
// ========================================
export async function list(req, res) {
  try {
    const books = await prisma.book.findMany({
      where: buildWhere(req.query),
      orderBy: buildOrderBy(req.query),
      include: { author: true }
    });

    return res.status(200).json({
      count: books.length,
      data: books
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 2. GET /books/search?q= - Ном хайх
// Өмнөх Семинар 6-ын endpoint
// ========================================
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

// ========================================
// 3. GET /books/:id - Нэг ном авах
// ========================================
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

// ========================================
// 4. POST /books - Шинэ ном нэмэх
// ========================================
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

// ========================================
// 5. PATCH /books/:id - Ном өөрчлөх
// ========================================
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

// ========================================
// 6. DELETE /books/:id - Ном устгах
// ========================================
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
