
import { prisma } from "../src/db.js";

const bat = await prisma.author.create({
  data: {
    name: "Бат",
    email: "bat@mail.mn"
  }
});

const saraa = await prisma.author.create({
  data: {
    name: "Сараа",
    email: "saraa@mail.mn"
  }
});

await prisma.book.createMany({
  data: [
    {
      title: "Node.js Basics",
      price: 45000,
      authorId: bat.id
    },
    {
      title: "Express in Action",
      price: 52000,
      authorId: bat.id
    },
    {
      title: "SQL for Kids",
      price: 30000,
      authorId: saraa.id
    },
    {
      title: "PostgreSQL Guide",
      price: 40000,
      authorId: saraa.id
    }
  ]
});

console.log("2 зохиогч, 4 ном амжилттай нэмэгдлээ");

await prisma.$disconnect();
