import { users, addUser } from "../data/users.js";

export function create(req, res) {
  const { email, password, ...rest } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email is required"
    });
  }

  const exists = users.some(
    user => user.email === email
  );

  if (exists) {
    return res.status(409).json({
      message: "Email already exists"
    });
  }

  const user = addUser({
    ...rest,
    email,
    password
  });

  const { password: removedPassword, ...safeUser } = user;

  res.status(201).json(safeUser);
}