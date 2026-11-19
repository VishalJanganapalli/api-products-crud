const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * @desc    Get all products with filtering, search, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      stockStatus,
      inStock,
      tags,
      // Conditional rendering filter keys
      isFeatured,
      isNewArrival,
      isOnSale,
      isBestSeller,
      isLimitedEdition,
      hasFreeShipping,
      requiresAgeVerification,
      displayBadge,
      deliveryType,
      status,
      // Sorting
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};

    // 1. Text Search (Search by name, description, brand, or SKU)
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    // 2. Exact/Regex Filters
    if (category) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }
    if (brand) {
      filter.brand = { $regex: new RegExp(`^${brand.trim()}$`, 'i') };
    }

    // 3. Range Filters (Price & Rating)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (minRating !== undefined && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    // 4. Stock Filtration
    if (stockStatus) {
      filter.stockStatus = stockStatus.toUpperCase();
    }
    if (inStock !== undefined) {
      if (inStock === 'true' || inStock === true) {
        filter.stockQuantity = { $gt: 0 };
      } else if (inStock === 'false' || inStock === false) {
        filter.stockQuantity = { $lte: 0 };
      }
    }

    // 5. Tags (Supports comma-separated tags e.g. ?tags=wireless,gaming)
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        filter.tags = { $in: tagList.map((t) => new RegExp(`^${t}$`, 'i')) };
      }
    }

    // 6. Conditional Rendering Keys Filters
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (isNewArrival !== undefined) {
      filter.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    }
    if (isOnSale !== undefined) {
      filter.isOnSale = isOnSale === 'true' || isOnSale === true;
    }
    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    }
    if (isLimitedEdition !== undefined) {
      filter.isLimitedEdition = isLimitedEdition === 'true' || isLimitedEdition === true;
    }
    if (hasFreeShipping !== undefined) {
      filter.hasFreeShipping = hasFreeShipping === 'true' || hasFreeShipping === true;
    }
    if (requiresAgeVerification !== undefined) {
      filter.requiresAgeVerification = requiresAgeVerification === 'true' || requiresAgeVerification === true;
    }
    if (displayBadge) {
      filter.displayBadge = displayBadge.toUpperCase();
    }
    if (deliveryType) {
      filter.deliveryType = deliveryType.toUpperCase();
    }

    // Status filter (defaults to active unless specified otherwise)
    if (status) {
      filter.status = status.toLowerCase();
    } else {
      filter.status = 'active';
    }

    // Sorting
    const allowedSortFields = ['price', 'rating', 'name', 'createdAt', 'stockQuantity', 'discountPercentage'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Execute Query (without pagination - returns all matching records)
    const products = await Product.find(filter)
      .sort(sortOptions)
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      filtersApplied: {
        search: search || null,
        category: category || null,
        brand: brand || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minRating: minRating || null,
        stockStatus: stockStatus || null,
        inStock: inStock !== undefined ? inStock : null,
        tags: tags || null,
        isFeatured: isFeatured !== undefined ? isFeatured : null,
        isOnSale: isOnSale !== undefined ? isOnSale : null,
        displayBadge: displayBadge || null,
        deliveryType: deliveryType || null,
        sortBy: sortField,
        order: sortDirection === 1 ? 'asc' : 'desc'
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: ${id}`
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Duplicate key error: Product with SKU '${req.body.sku}' already exists.`
      });
    }
    next(error);
  }
};

/**
 * @desc    Full update (replace) a product by ID
 * @route   PUT /api/products/:id
 * @access  Public
 */
exports.updateProductFull = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: ${id}`
      });
    }

    // Required fields check for full replacement (PUT)
    const requiredFields = ['name', 'sku', 'description', 'price', 'category', 'brand', 'stockQuantity', 'thumbnail'];
    const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === '');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Full update (PUT) requires all mandatory fields. Missing: ${missing.join(', ')}`
      });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    // Replace properties
    Object.assign(existingProduct, req.body);
    const updatedProduct = await existingProduct.save();

    return res.status(200).json({
      success: true,
      message: 'Product replaced successfully (PUT)',
      data: updatedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Duplicate SKU error: SKU '${req.body.sku}' already exists.`
      });
    }
    next(error);
  }
};

/**
 * @desc    Partial update of a product by ID
 * @route   PATCH /api/products/:id
 * @access  Public
 */
exports.updateProductPartial = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: ${id}`
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for PATCH update'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    // Update only the provided fields
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product partially updated successfully (PATCH)',
      data: updatedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Duplicate SKU error: SKU '${req.body.sku}' already exists.`
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Public
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: ${id}`
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product '${deletedProduct.name}' (${deletedProduct.sku}) was deleted successfully`,
      data: {
        id: deletedProduct._id,
        sku: deletedProduct.sku,
        name: deletedProduct.name
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get metadata: Categories, Brands, and Badge statistics
 * @route   GET /api/products/meta/summary
 * @access  Public
 */
exports.getProductMetadata = async (req, res, next) => {
  try {
    const [categories, brands, badges] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('brand'),
      Product.aggregate([
        { $match: { displayBadge: { $ne: 'NONE' } } },
        { $group: { _id: '$displayBadge', count: { $sum: 1 } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCategories: categories.length,
        categories,
        totalBrands: brands.length,
        brands,
        badgeSummary: badges.map((b) => ({ badge: b._id, count: b.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};
