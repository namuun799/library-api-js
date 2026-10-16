export const books = [
  { id: 1, title: "Node.js Basics", price: 25000, isAvailable: true },
  { id: 2, title: "JavaScript Guide", price: 30000, isAvailable: true },
  { id: 3, title: "Express Basics", price: 20000, isAvailable: true }
];

let nextId = 4;

export function findBookById(id) {
  return books.find((book) => book.id === id) || null;
}

export function addBook(input) {
  const book = {
    id: nextId++,
    isAvailable: true,
    ...input
  };

  books.push(book);
  return book;
}

export function updateBook(id, changes) {
  const book = findBookById(id);
  if (!book) return null;

  Object.assign(book, changes);
  return book;//нь нэг объектын property-уудыг нөгөө объект руу хуулдаг.
}

export function removeBook(id) {
  const index = books.findIndex((book) => book.id === id);//массив дотроос өгсөн id-тай таарах номын хэд дэх байрлалд
  if (index === -1) return false;

  books.splice(index, 1);
  return true;
}
