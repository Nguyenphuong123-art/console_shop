import express from 'express'
import knex from 'knex'
import knexfile from '../knexfile.js'

const router = express.Router()
const db = knex(knexfile[process.env.NODE_ENV || 'development'])

// Public API for frontend
router.get('/products', async (req, res) => {
  try {
    const products = await db('products').select('*')
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/products/:id', async (req, res) => {
  try {
    const p = await db('products').where({ id: req.params.id }).first()
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json(p)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Return current logged-in user's full profile (uses session). Returns 401 if not logged in.
router.get('/me', async (req, res) => {
  try {
    const sessionUser = req.session && req.session.user
    if (!sessionUser || !sessionUser.id) return res.status(401).json({ error: 'Not authenticated' })
    const u = await db('users').where({ id: sessionUser.id }).first()
    if (!u) return res.status(404).json({ error: 'User not found' })
    const fullUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || null,
      address: u.address || null,
      avatar: u.avatar || null
    }
    res.json({ ok: true, user: fullUser })
  } catch (err) {
    console.error('/api/me error', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
