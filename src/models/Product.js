const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Original price must be positive'],
      default: null
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
      index: true
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    stockStatus: {
      type: String,
      enum: {
        values: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'DISCONTINUED'],
        message: '{VALUE} is not a valid stock status'
      },
      default: 'IN_STOCK'
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    reviewCount: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      unit: { type: String, default: 'cm' }
    },
    weight: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: 'kg' }
    },

    // ----------------------------------------------------
    // Frontend Conditional Rendering Keys & Badges
    // Use these flags directly on the frontend for UI logic
    // ----------------------------------------------------
    isFeatured: {
      type: Boolean,
      default: false,
      index: true // allows fast filtration for featured showcase
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    isOnSale: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isLimitedEdition: {
      type: Boolean,
      default: false
    },
    hasFreeShipping: {
      type: Boolean,
      default: false
    },
    requiresAgeVerification: {
      type: Boolean,
      default: false
    },
    allowCustomerReviews: {
      type: Boolean,
      default: true
    },
    canReturn: {
      type: Boolean,
      default: true
    },
    displayBadge: {
      type: String,
      enum: ['NONE', 'NEW', 'HOT', 'SALE', 'LIMITED', 'BESTSELLER', 'CLEARANCE'],
      default: 'NONE'
    },
    deliveryType: {
      type: String,
      enum: ['STANDARD', 'EXPRESS', 'SAME_DAY', 'DIGITAL_DOWNLOAD'],
      default: 'STANDARD'
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Auto-derive conditional rendering helpers prior to save
productSchema.pre('save', function (next) {
  // Derive isOnSale & discountPercentage if compareAtPrice is present
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    this.isOnSale = true;
    if (!this.discountPercentage || this.discountPercentage === 0) {
      this.discountPercentage = Math.round(
        ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
      );
    }
  }

  // Derive stockStatus based on quantity if not manually marked PRE_ORDER or DISCONTINUED
  if (this.stockStatus !== 'PRE_ORDER' && this.stockStatus !== 'DISCONTINUED') {
    if (this.stockQuantity <= 0) {
      this.stockStatus = 'OUT_OF_STOCK';
    } else if (this.stockQuantity <= 5) {
      this.stockStatus = 'LOW_STOCK';
    } else {
      this.stockStatus = 'IN_STOCK';
    }
  }

  next();
});

// Text index for full-text search
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
  tags: 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
