import db from '../db/knex.js';

export function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}

export async function ensureAdminExists(req, res, next) {
  const admin = await db('users').where({ role: 'admin' }).first();
  if (!admin) {
    // Nếu chưa có admin, cho phép truy cập để tạo admin đầu tiên
    return next();
  }
  // Nếu đã có admin, kiểm tra đăng nhập
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}