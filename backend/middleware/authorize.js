function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You are not allowed to perform this action.' });
    }
    return next();
  };
}

module.exports = authorize;