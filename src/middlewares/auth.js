export function isAuthenticated(
  req,
  res,
  next
) {
  if (req.session.user) {
    return next();
  }
  return res.redirect('/auth/login');
}

export function isAdmin(
  req,
  res,
  next
) {
  if (req.session.user?.role === 'ADMIN') {
    return next();
  }
  return res.status(403).send('Access denied');
}
