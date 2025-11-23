 import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function productRoutes(db) {
  const router = express.Router();
  
  // Multer setup for image upload
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  // 📋 Danh sách sản phẩm
  router.get("/", async (req, res) => {
    const products = await db("products").select("*").orderBy("id", "desc");
    // Parse images JSON for each product
    products.forEach(p => {
      if (typeof p.images === 'string') {
        try { p.images = JSON.parse(p.images); } catch { p.images = []; }
      } else if (!Array.isArray(p.images)) {
        p.images = [];
      }
    });
    res.render("products/index", { products });
  });

  // ➕ Form thêm mới
  router.get("/new", (req, res) => {
    res.render("products/new", { form: {}, error: null });
  });

  // 💾 Lưu sản phẩm mới
  router.post("/", upload.array('images', 10), async (req, res) => {
    const { name, description, price, quantity, origin, brand, category } = req.body;
    // Validate price: must be a number and not exceed 999999999999.99 (12 digits, 2 decimals)
    let error = null;
    let priceNum = Number(price);
    if (isNaN(priceNum) || priceNum > 999999999999.99) {
      error = "Giá sản phẩm vượt quá giới hạn cho phép (tối đa 999999999999.99).";
    }
    // Handle uploaded images
    let imagesArr = [];
    if (req.files && req.files.length > 0) {
      imagesArr = req.files.map(f => '/uploads/' + f.filename);
    }
    if (error) {
      // Re-render form with error and previously entered values
      return res.status(400).render("products/new", {
        error,
        form: { name, description, price, quantity, origin, brand, category }
      });
    }
    await db("products").insert({ name, description, price, quantity, origin, brand, category, images: JSON.stringify(imagesArr) });
    res.redirect("/products");
  });
    // Trang chi tiết sản phẩm
  router.get("/:id", async (req, res) => {
    const product = await db("products").where({ id: req.params.id }).first();
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
    let images = [];
    try {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : [];
    } catch (e) {}
    res.render("products/show", { product, images });
  });

  // ✏️ Form chỉnh sửa
  router.get("/:id/edit", async (req, res) => {
    const product = await db("products").where({ id: req.params.id }).first();
    res.render("products/edit", { product });
  });

  // 🔄 Cập nhật sản phẩm
  router.put("/:id", upload.array('images', 10), async (req, res) => {
    const { name, description, price, quantity, origin, brand, category } = req.body;
    await db("products").where({ id: req.params.id }).update({ name, description, price, quantity, origin, brand, category });
    res.redirect("/products");
  });

  // ❌ Xóa sản phẩm
  router.delete("/:id", async (req, res) => {
    await db("products").where({ id: req.params.id }).del();
    res.redirect("/products");
  });

  return router;
}
