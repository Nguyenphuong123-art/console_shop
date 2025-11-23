const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// List orders
router.get('/', async (req, res) => {
  const orders = await db('orders')
    .select('orders.*', 'users.name as user_name', 'products.name as product_name')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('products', 'orders.product_id', 'products.id')
    .orderBy('orders.created_at', 'desc');
  res.render('orders/index', { orders });
});

// New order form
router.get('/new', async (req, res) => {
  const users = await db('users').select();
  const products = await db('products').select();
  res.render('orders/new', { users, products, error: null });
});

// Create order
router.post('/', upload.single('payment_receipt'), async (req, res) => {
  try {
    const { user_id, product_id, quantity, payment_receipt: payment_text, shipping_address, status } = req.body;
    let payment_receipt = payment_text || null;
    if (req.file) payment_receipt = '/uploads/' + req.file.filename;
    await db('orders').insert({ user_id, product_id, quantity: quantity || 1, payment_receipt, shipping_address, status: status || 'pending' });
    res.redirect('/orders');
  } catch (err) {
    res.render('orders/new', { users: await db('users').select(), products: await db('products').select(), error: 'Dữ liệu không hợp lệ.' });
  }
});

// Show order
router.get('/:id', async (req, res) => {
  const order = await db('orders')
    .select('orders.*', 'users.name as user_name', 'users.email as user_email', 'products.name as product_name')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('products', 'orders.product_id', 'products.id')
    .where('orders.id', req.params.id)
    .first();
  if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
  res.render('orders/show', { order });
});

// Edit form
router.get('/:id/edit', async (req, res) => {
  const order = await db('orders').where({ id: req.params.id }).first();
  if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
  const users = await db('users').select();
  const products = await db('products').select();
  res.render('orders/edit', { order, users, products, error: null });
});

// Update
router.post('/:id', upload.single('payment_receipt'), async (req, res) => {
  try {
    const { user_id, product_id, quantity, payment_receipt: payment_text, shipping_address, status } = req.body;
    let payment_receipt = payment_text || null;
    if (req.file) payment_receipt = '/uploads/' + req.file.filename;
    await db('orders').where({ id: req.params.id }).update({ user_id, product_id, quantity: quantity || 1, payment_receipt, shipping_address, status });
    res.redirect('/orders/' + req.params.id);
  } catch (err) {
    const order = await db('orders').where({ id: req.params.id }).first();
    res.render('orders/edit', { order, users: await db('users').select(), products: await db('products').select(), error: 'Cập nhật không thành công.' });
  }
});

// Delete
router.post('/:id/delete', async (req, res) => {
  await db('orders').where({ id: req.params.id }).del();
  res.redirect('/orders');
});

module.exports = router;
