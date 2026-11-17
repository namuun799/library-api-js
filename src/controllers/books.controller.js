

import { prisma } from "../db.js";

// ========================================
// 1. SEMINAR 9 - FILTERING
// ========================================
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

  // Боломжтой эсэхээр шүүх
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

  // Олон ID-гаар ном шүүх
  if (query.ids !== undefined) {
    const ids = String(query.ids)
      .split(",")
      .map((value) => Number(value.trim()));

    if (
      ids.length === 0 ||
      ids.some(
        (id) => !Number.isInteger(id) || id <= 0
      )
    ) {
      throw {
        status: 400,
        message: "ids нь эерэг бүхэл тоонууд байх ёстой"
      };
    }

    where.id = { in: ids };
  }

  return where;
}

// ========================================
// 2. SEMINAR 9 - SORTING
// ========================================
function buildOrderBy(query) {
  const allowed = ["title", "price", "createdAt"];

  let sort = String(query.sort || "createdAt");
  let order = query.order === "asc" ? "asc" : "desc";

  // Богино эрэмбэлэлт: sort=-price
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

  // Зөвшөөрөгдөөгүй талбар
  if (!allowed.includes(sort)) {
    sort = "createdAt";
    order = "desc";
  }

  return { [sort]: order };
}

// ========================================
// 3. SEMINAR 10 - PAGINATION
// ========================================
function getPaging(query) {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page =
    Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(50, rawLimit)
      : 10;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// ========================================
// 4. GET /books
// Filtering + Sorting + Pagination
// ========================================
export async function list(req, res) {
  try {
    const { page, limit, skip } = getPaging(req.query);

    const where = buildWhere(req.query);
    const orderBy = buildOrderBy(req.query);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { author: true }
      }),

      prisma.book.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    

    return res.status(200).json({
      data: books,
      meta: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 5. GET /books/search?q=
// ========================================
export async function search(req, res) {
  try {
    const q = String(req.query.q || "").trim();

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

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 6. GET /books/:id
// ========================================
export async function getOne(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID"
    });
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!book) {
      return res.status(404).json({
        message: "Ном олдсонгүй"
      });
    }

    return res.status(200).json(book);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 7. POST /books
// ========================================
export async function create(req, res) {
  const { title, price, authorId, isAvailable } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !Number.isInteger(price) ||
    price < 0 ||
    !Number.isInteger(authorId) ||
    authorId <= 0 ||
    (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    )
  ) {
    return res.status(400).json({
      message: "Номын мэдээлэл буруу байна"
    });
  }

  try {
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
        authorId,
        ...(isAvailable !== undefined
          ? { isAvailable }
          : {})
      }
    });

    return res.status(201).json(book);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 8. PATCH /books/:id
// ========================================
export async function update(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID"
    });
  }

  const { title, price, isAvailable, authorId } = req.body;

  if (
    (title !== undefined &&
      (typeof title !== "string" || !title.trim())) ||
    (price !== undefined &&
      (!Number.isInteger(price) || price < 0)) ||
    (isAvailable !== undefined &&
      typeof isAvailable !== "boolean") ||
    (authorId !== undefined &&
      (!Number.isInteger(authorId) || authorId <= 0))
  ) {
    return res.status(400).json({
      message: "Шинэчлэх мэдээлэл буруу байна"
    });
  }

  try {
    if (authorId !== undefined) {
      const author = await prisma.author.findUnique({
        where: { id: authorId }
      });

      if (!author) {
        return res.status(404).json({
          message: "Зохиолч олдсонгүй"
        });
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(title !== undefined
          ? { title: title.trim() }
          : {}),
        ...(price !== undefined ? { price } : {}),
        ...(isAvailable !== undefined
          ? { isAvailable }
          : {}),
        ...(authorId !== undefined ? { authorId } : {})
      }
    });

    return res.status(200).json(book);

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Ном олдсонгүй"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}

// ========================================
// 9. DELETE /books/:id
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
        message: "Ном олдсонгүй"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Серверийн алдаа гарлаа"
    });
  }
}
