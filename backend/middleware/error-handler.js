// Wraps async handlers so rejected promises reach the error handler (Express 4).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === 'P2002') return res.status(409).json({ error: 'Record already exists.' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found.' });
  if (err.code === 'P2003') return res.status(400).json({ error: 'Related record does not exist.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { asyncHandler, notFound, errorHandler };
