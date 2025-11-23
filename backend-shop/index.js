import session from "express-session";
import { requireAdmin, ensureAdminExists } from "./middleware/auth.js";
import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import knexConfig from "./db/knex.js";
import knex from "knex";
import knexfile from "./knexfile.js";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = knex(knexfile[process.env.NODE_ENV || "development"]);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Allow frontend dev server to access API
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(session({
	secret: process.env.SESSION_SECRET || 'secret-key',
	resave: false,
	saveUninitialized: false
}));

// (root/dashboard handlers are declared later with proper protection)

// Đăng nhập
app.get("/login", (req, res) => {
	res.render("login", { error: null });
});
app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body || {};

		// If request comes from the frontend SPA (JSON), allow any role to login.
		// For the server-rendered admin form, require role 'admin' so regular customers
		// cannot access the admin dashboard via the form.
		const isJsonRequest = req.is('application/json') || (req.headers.accept && req.headers.accept.includes('application/json'));

		let user;
		if (isJsonRequest) {
			user = await db('users').where({ email, password }).first();
		} else {
			user = await db('users').where({ email, password, role: 'admin' }).first();
		}

		if (user) {
			// Save minimal session data
			req.session.user = { id: user.id, name: user.name, role: user.role };
			if (isJsonRequest) {
				// Return fuller user profile for the SPA so frontend can show avatar/phone/address
				const fullUser = {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					phone: user.phone || null,
					address: user.address || null,
					avatar: user.avatar || null
				};
				return res.status(200).json({ ok: true, user: fullUser });
			}
			return res.redirect('/dashboard');
		}

		const errMsg = isJsonRequest ? 'Sai email hoặc mật khẩu.' : 'Sai email hoặc mật khẩu, hoặc bạn không phải quản trị viên.';
		if (isJsonRequest) {
			return res.status(401).json({ error: errMsg });
		}
		res.render('login', { error: errMsg });
	} catch (err) {
		console.error('Login error', err);
		if (req.is('application/json') || req.headers.accept && req.headers.accept.includes('application/json')) {
			return res.status(500).json({ error: 'Server error' });
		}
		res.status(500).render('login', { error: 'Server error' });
	}
});
app.get("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/login");
	});
});

// Bảo vệ các route quản trị
app.get("/", ensureAdminExists, (req, res) => res.redirect("/dashboard"));
app.get("/dashboard", requireAdmin, (req, res) => res.render("dashboard"));

// Import routes
import productRoutes from "./routes/products.js";
import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import apiRouter from "./routes/api.js";
// Register only protected admin routes
app.use("/products", requireAdmin, productRoutes(db));
app.use("/users", requireAdmin, usersRouter);
app.use("/orders", requireAdmin, ordersRouter);
// Public API used by frontend
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
