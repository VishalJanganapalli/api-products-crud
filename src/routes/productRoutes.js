const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProductFull,
  updateProductPartial,
  deleteProduct,
  getProductMetadata
} = require('../controllers/productController');

// Metadata route (must be defined before /:id)
router.get('/meta/summary', getProductMetadata);

// Root products routes
router.route('/')
  .get(getProducts)
  .post(createProduct);

// Single product routes
router.route('/:id')
  .get(getProductById)
  .put(updateProductFull)
  .patch(updateProductPartial)
  .delete(deleteProduct);

module.exports = router;
