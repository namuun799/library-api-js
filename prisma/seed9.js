
import { prisma } from "../src/db.js";

async function main() {
  const bat = await prisma.author.upsert({
    where: { email: "bat@mail.mn" },
    update: { name: "Бат" },
    create: { name: "Бат", email: "bat@mail.mn" }
  });

  const saraa = await prisma.author.upsert({
    where: { email: "saraa@mail.mn" },
    update: { name: "Сараа" },
    create: { name: "Сараа", email: "saraa@mail.mn" }
  });

  const bold = await prisma.author.upsert({
    where: { email: "bold@mail.mn" },
    update: { name: "Болд" },
    create: { name: "Болд", email: "bold@mail.mn" }
  });

  const books = [
    {
      title: "Node.js Testing",
      price: 58000,
      authorId: bat.id
    },
    {
      title: "REST API Design",
      price: 39000,
      authorId: saraa.id,
      isAvailable: false
    },
    {
      title: "SQL Joins",
      price: 27000,
      authorId: saraa.id
    },
    {
      title: "Express Security",
      price: 66000,
      authorId: bold.id
    },
    {
      title: "Prisma Relations",
      price: 48000,
      authorId: bold.id
    },
    {
      title: "Node Streams",
      price: 72000,
      authorId: bold.id,
      isAvailable: false
    }
  ];

  for (const book of books) {
    const existing = await prisma.book.findFirst({
      where: {
        title: book.title,
        authorId: book.authorId
      }
    });

    if (!existing) {
      await prisma.book.create({ data: book });
    }
  }

  console.log("Семинар 9-ийн туршилтын номууд бэлэн боллоо");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
