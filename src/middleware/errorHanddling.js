const notFound = (req, res, next) => {
  const error = new Error('Not Found Some thing Is Wrong')
  res.status(404)  
  next(error)
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;
  res.status(statusCode).json({ data: [err.message||err].flat() })
}
module.exports = {notFound,errorHandler}