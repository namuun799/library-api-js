export const users = [];

export function addUser(user) {
  const newUser = {
    id: users.length + 1,
    ...user
  };

  users.push(newUser);
  return newUser;
}