const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db/knex');

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// List all users
router.get('/', async (req, res) => {
  const users = await db('users').select();
  res.render('users/index', { users });
});

// Show form to create new user
router.get('/new', (req, res) => {
  res.render('users/new', { error: null });
});

// Create new user
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    let avatar = req.file ? '/avatars/' + req.file.filename : null;
    await db('users').insert({ name, email, password, phone, address, avatar, role });
    res.redirect('/users');
  } catch (err) {
    res.render('users/new', { error: 'Email đã tồn tại hoặc dữ liệu không hợp lệ.' });
  }
});

// Show user detail
router.get('/:id', async (req, res) => {
  const user = await db('users').where({ id: req.params.id }).first();
  if (!user) return res.status(404).send('Không tìm thấy người dùng');
  res.render('users/show', { user });
});

// Show form to edit user
router.get('/:id/edit', async (req, res) => {
  const user = await db('users').where({ id: req.params.id }).first();
  if (!user) return res.status(404).send('Không tìm thấy người dùng');
  res.render('users/edit', { user, error: null });
});

// Update user
router.post('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    let updateData = { name, email, phone, address, role };
    if (password) {
      updateData.password = password;
    }
    if (req.file) updateData.avatar = '/avatars/' + req.file.filename;
    await db('users').where({ id: req.params.id }).update(updateData);
    res.redirect('/users/' + req.params.id);
  } catch (err) {
    const user = await db('users').where({ id: req.params.id }).first();
    res.render('users/edit', { user, error: 'Email đã tồn tại hoặc dữ liệu không hợp lệ.' });
  }
});

// Delete user
router.post('/:id/delete', async (req, res) => {
  await db('users').where({ id: req.params.id }).del();
  res.redirect('/users');
});

module.exports = router;
