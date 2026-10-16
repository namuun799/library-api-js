export function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
    path: req.url
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(500).json({
    message: "Internal server error"
  });
}
