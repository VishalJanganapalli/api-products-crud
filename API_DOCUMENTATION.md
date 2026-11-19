# Products CRUD API - Full Documentation

A production-ready RESTful CRUD API for managing Products built with **Node.js**, **Express**, and **MongoDB Atlas** (using **Mongoose**).

---

## Table of Contents
1. [Overview & Features](#overview--features)
2. [Conditional Rendering Keys (Frontend Integration)](#conditional-rendering-keys-frontend-integration)
3. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
4. [Installation & Quick Start](#installation--quick-start)
5. [Database Seeding](#database-seeding)
6. [Data Model Schema (30 Fields)](#data-model-schema-30-fields)
7. [Filtration, Search, Sorting & Pagination](#filtration-search-sorting--pagination)
8. [API Endpoints Reference (Request & Response Examples)](#api-endpoints-reference)
   - [1. GET /api/products (List with Filtration)](#1-get-apiproducts-list-with-filtration)
   - [2. GET /api/products/:id (Get Single Product)](#2-get-apiproductsid-get-single-product)
   - [3. POST /api/products (Create Product)](#3-post-apiproducts-create-product)
   - [4. PUT /api/products/:id (Full Replacement)](#4-put-apiproductsid-full-replacement)
   - [5. PATCH /api/products/:id (Partial Update)](#5-patch-apiproductsid-partial-update)
   - [6. DELETE /api/products/:id (Delete Product)](#6-delete-apiproductsid-delete-product)
   - [7. GET /api/products/meta/summary (Categories & Brands Summary)](#7-get-apiproductsmetasummary)
9. [Frontend Conditional Rendering Code Examples](#frontend-conditional-rendering-code-examples)

---

## Overview & Features

- **Full RESTful CRUD**: Implements `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- **Advanced Filtration**: Filter by `category`, `brand`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `stockStatus`, `tags`, and conditional flags.
- **Full-Text Multi-field Search**: Search query across `name`, `description`, `brand`, `sku`, and `tags`.
- **Sorting & Pagination**: Configurable sort field, sort direction, page number, and limit with complete pagination metadata (`hasNextPage`, `hasPrevPage`, `totalPages`).
- **Keys for Conditional Rendering**: Dedicated boolean flags and enum badges tailored for frontend conditional UI displays (e.g. Sale badges, Low Stock warnings, 18+ verification gates, Free Shipping indicators).
- **At least 15 Fields per Object**: Every product document contains **30 rich fields** (double the minimum requirement of 15).
- **Minimum 20 Seed Records**: Seed script includes **25 realistic products** across diverse categories.

---

## Conditional Rendering Keys (Frontend Integration)

The API includes dedicated keys in each product object designed specifically for frontend conditional rendering:

| Key | Type | Possible Values | Frontend UI Use-Case |
| :--- | :--- | :--- | :--- |
| `isFeatured` | Boolean | `true`, `false` | Displays a **Featured** highlight card or hero carousel placement |
| `isNewArrival` | Boolean | `true`, `false` | Renders a **NEW** badge in product grid |
| `isOnSale` | Boolean | `true`, `false` | Renders **SALE** ribbon and displays strike-through original price |
| `isBestSeller` | Boolean | `true`, `false` | Displays a **Best Seller** gold star badge |
| `isLimitedEdition` | Boolean | `true`, `false` | Renders **Limited Edition** scarcity alert |
| `hasFreeShipping` | Boolean | `true`, `false` | Displays **Free Shipping** truck icon |
| `requiresAgeVerification` | Boolean | `true`, `false` | Triggers a **18+ Age Verification Modal** before checkout |
| `allowCustomerReviews` | Boolean | `true`, `false` | Conditionally shows or hides the **Write a Review** form |
| `canReturn` | Boolean | `true`, `false` | Displays **30-Day Free Return Guarantee** icon |
| `displayBadge` | String Enum | `'NONE'`, `'NEW'`, `'HOT'`, `'SALE'`, `'LIMITED'`, `'BESTSELLER'`, `'CLEARANCE'` | Ready-to-render pill badge text/color |
| `stockStatus` | String Enum | `'IN_STOCK'`, `'LOW_STOCK'`, `'OUT_OF_STOCK'`, `'PRE_ORDER'`, `'DISCONTINUED'` | Renders stock pill (Green, Amber, Red, Blue, Grey) and disables "Add to Cart" if OUT_OF_STOCK |
| `deliveryType` | String Enum | `'STANDARD'`, `'EXPRESS'`, `'SAME_DAY'`, `'DIGITAL_DOWNLOAD'` | Renders shipping speed estimate icon |

---

## MongoDB Atlas Setup Guide

1. Log into your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
2. Under **Deployment** > **Database**, click **Create Cluster** (Shared M0 free tier).
3. Under **Security** > **Database Access**:
   - Create a database user (e.g., `appUser`) with read/write privileges and a secure password.
4. Under **Security** > **Network Access**:
   - Click **Add IP Address** and add your current IP address (or `0.0.0.0/0` for development access).
5. Go back to **Databases** > Click **Connect** on your cluster:
   - Select **Drivers** (Node.js).
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/products_db?retryWrites=true&w=majority
     ```
6. Open `.env` in the project root and paste the URI into `MONGODB_URI`.

---

## Installation & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure .env file
# Edit .env with your MongoDB Atlas URI:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/products_db?retryWrites=true&w=majority

# 3. Seed the database with 25 rich product records
npm run seed

# 4. Start the server (development mode)
npm run dev

# Or start in production mode
npm start
```

The server will start on: `http://localhost:5000`

---

## Database Seeding

Run the seed command to clear and populate your MongoDB Atlas database with 25 product objects:

```bash
npm run seed
```

Output:
```
Connected to MongoDB Atlas: cluster0.abcde.mongodb.net / products_db
Clearing existing products collection...
Inserting 25 rich product records (each with 25+ fields)...
----------------------------------------------------
 SUCCESS: Seeded 25 products successfully!
----------------------------------------------------
Distinct Categories (7): Electronics, Gaming, Wearables, Home & Kitchen, Sports & Fitness, Office & Furniture, Beauty & Personal Care...
```

---

## Data Model Schema (30 Fields)

Each product document contains the following fields:

```typescript
{
  _id: ObjectId,                     // Auto-generated MongoDB ObjectId
  name: String,                      // Product name (e.g. "AeroPulse Headphones")
  sku: String,                       // Unique Stock Keeping Unit (e.g. "AUDIO-AP-001")
  description: String,               // Full markdown/text product description
  shortDescription: String,          // Quick 1-sentence synopsis for catalog cards
  price: Number,                     // Selling price (e.g. 199.99)
  compareAtPrice: Number,            // Original strike-through price (e.g. 249.99)
  discountPercentage: Number,        // Auto-computed percentage discount (e.g. 20)
  category: String,                  // Category (e.g. "Electronics", "Gaming")
  brand: String,                     // Manufacturer / Brand (e.g. "AeroPulse")
  stockQuantity: Number,             // Inventory count (e.g. 42)
  stockStatus: String,               // "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" | "DISCONTINUED"
  rating: Number,                    // Average rating 0 - 5.0 (e.g. 4.8)
  reviewCount: Number,               // Total customer reviews (e.g. 312)
  images: [String],                  // High-resolution image URLs
  thumbnail: String,                 // Primary catalog thumbnail image URL
  tags: [String],                    // Search tags (e.g. ["audio", "wireless", "anc"])
  dimensions: {                      // Physical dimensions
    length: Number,
    width: Number,
    height: Number,
    unit: String                     // Default: "cm"
  },
  weight: {                          // Weight object
    value: Number,
    unit: String                     // Default: "kg"
  },
  // CONDITIONAL RENDERING KEYS:
  isFeatured: Boolean,               // Highlight in hero/showcase
  isNewArrival: Boolean,             // Display "NEW" badge
  isOnSale: Boolean,                 // Show sale tag and strike-through
  isBestSeller: Boolean,             // Show "Best Seller" ribbon
  isLimitedEdition: Boolean,         // Show "Limited" scarcity alert
  hasFreeShipping: Boolean,          // Show "Free Shipping" icon
  requiresAgeVerification: Boolean,  // Trigger 18+ modal prompt
  allowCustomerReviews: Boolean,     // Enable/disable review submission UI
  canReturn: Boolean,                // Render 30-day return policy guarantee
  displayBadge: String,              // "NONE" | "NEW" | "HOT" | "SALE" | "LIMITED" | "BESTSELLER" | "CLEARANCE"
  deliveryType: String,              // "STANDARD" | "EXPRESS" | "SAME_DAY" | "DIGITAL_DOWNLOAD"
  status: String,                    // "active" | "draft" | "archived"
  createdAt: Date,                   // Auto-managed timestamp
  updatedAt: Date                    // Auto-managed timestamp
}
```

---

## Filtration, Search, Sorting & Pagination

Use query parameters on `GET /api/products`:

| Query Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | `?search=wireless` | Searches `name`, `description`, `brand`, `sku`, and `tags` |
| `category` | String | `?category=Electronics` | Filter by category (case-insensitive) |
| `brand` | String | `?brand=AeroPulse` | Filter by brand name |
| `minPrice` | Number | `?minPrice=50` | Minimum price filter (`$gte`) |
| `maxPrice` | Number | `?maxPrice=300` | Maximum price filter (`$lte`) |
| `minRating` | Number | `?minRating=4.5` | Filter products with rating $\ge$ 4.5 |
| `inStock` | Boolean | `?inStock=true` | `true` (stock > 0), `false` (stock = 0) |
| `stockStatus` | String | `?stockStatus=IN_STOCK` | `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `PRE_ORDER` |
| `tags` | String | `?tags=wireless,gaming` | Filter products containing any of the given tags |
| `isFeatured` | Boolean | `?isFeatured=true` | Filter products for featured showcase |
| `isOnSale` | Boolean | `?isOnSale=true` | Filter discounted products |
| `hasFreeShipping` | Boolean | `?hasFreeShipping=true` | Filter free shipping items |
| `displayBadge` | String | `?displayBadge=BESTSELLER` | Filter by badge type |
| `deliveryType` | String | `?deliveryType=SAME_DAY` | Filter by delivery method |
| `sortBy` | String | `?sortBy=price` | Sort by: `price`, `rating`, `name`, `createdAt`, `stockQuantity` |
| `order` | String | `?order=asc` | `asc` (ascending) or `desc` (descending, default) |
| `page` | Integer | `?page=2` | Page number (default: 1) |
| `limit` | Integer | `?limit=10` | Products per page (default: 10, max: 100) |

---

## API Endpoints Reference

### 1. GET /api/products (List with Filtration)

Fetch products with multiple filter criteria, search, sorting, and pagination.

#### Example Request:
```http
GET /api/products?category=Electronics&minPrice=100&isOnSale=true&sortBy=price&order=asc&page=1&limit=2 HTTP/1.1
Host: localhost:5000
Accept: application/json
```

#### Example cURL:
```bash
curl "http://localhost:5000/api/products?category=Electronics&isOnSale=true&page=1&limit=2"
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "count": 2,
  "total": 4,
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filtersApplied": {
    "search": null,
    "category": "Electronics",
    "brand": null,
    "minPrice": "100",
    "maxPrice": null,
    "minRating": null,
    "stockStatus": null,
    "inStock": null,
    "tags": null,
    "isFeatured": null,
    "isOnSale": "true",
    "displayBadge": null,
    "deliveryType": null,
    "sortBy": "price",
    "order": "asc"
  },
  "data": [
    {
      "_id": "673cae0291f098001234abcd",
      "name": "AeroPulse Wireless Noise-Cancelling Headphones",
      "sku": "AUDIO-AP-001",
      "description": "Premium over-ear wireless headphones engineered with hybrid active noise cancellation, 40mm titanium drivers, and up to 45 hours of battery life with ultra-low latency.",
      "shortDescription": "Hybrid ANC headphones with 45-hour battery life.",
      "price": 199.99,
      "compareAtPrice": 249.99,
      "discountPercentage": 20,
      "category": "Electronics",
      "brand": "AeroPulse",
      "stockQuantity": 42,
      "stockStatus": "IN_STOCK",
      "rating": 4.8,
      "reviewCount": 312,
      "images": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
      ],
      "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "tags": ["audio", "wireless", "noise-cancelling", "bluetooth"],
      "dimensions": { "length": 18.5, "width": 8.2, "height": 20.0, "unit": "cm" },
      "weight": { "value": 0.28, "unit": "kg" },
      "isFeatured": true,
      "isNewArrival": false,
      "isOnSale": true,
      "isBestSeller": true,
      "isLimitedEdition": false,
      "hasFreeShipping": true,
      "requiresAgeVerification": false,
      "allowCustomerReviews": true,
      "canReturn": true,
      "displayBadge": "BESTSELLER",
      "deliveryType": "EXPRESS",
      "status": "active",
      "createdAt": "2026-11-19T04:00:00.000Z",
      "updatedAt": "2026-11-19T04:00:00.000Z"
    },
    {
      "_id": "673cae0291f098001234abce",
      "name": "LumixPro Professional Studio Softbox Lighting Kit",
      "sku": "PHOTO-LP-014",
      "description": "Complete dual continuous 200W bi-color LED video lighting system with 90cm octagonal quick-release softboxes.",
      "shortDescription": "200W bi-color LED studio lighting kit with octagonal softboxes.",
      "price": 269.99,
      "compareAtPrice": 329.99,
      "discountPercentage": 18,
      "category": "Electronics",
      "brand": "LumixPro",
      "stockQuantity": 11,
      "stockStatus": "IN_STOCK",
      "rating": 4.7,
      "reviewCount": 115,
      "images": [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"
      ],
      "thumbnail": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      "tags": ["photography", "lighting", "video"],
      "dimensions": { "length": 85.0, "width": 25.0, "height": 25.0, "unit": "cm" },
      "weight": { "value": 7.2, "unit": "kg" },
      "isFeatured": false,
      "isNewArrival": false,
      "isOnSale": true,
      "isBestSeller": false,
      "isLimitedEdition": false,
      "hasFreeShipping": true,
      "requiresAgeVerification": false,
      "allowCustomerReviews": true,
      "canReturn": true,
      "displayBadge": "SALE",
      "deliveryType": "STANDARD",
      "status": "active",
      "createdAt": "2026-11-19T04:00:00.000Z",
      "updatedAt": "2026-11-19T04:00:00.000Z"
    }
  ]
}
```

---

### 2. GET /api/products/:id (Get Single Product)

Fetch a single product by its MongoDB `_id`.

#### Example Request:
```http
GET /api/products/673cae0291f098001234abcd HTTP/1.1
Host: localhost:5000
Accept: application/json
```

#### Example cURL:
```bash
curl http://localhost:5000/api/products/673cae0291f098001234abcd
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "673cae0291f098001234abcd",
    "name": "AeroPulse Wireless Noise-Cancelling Headphones",
    "sku": "AUDIO-AP-001",
    "description": "Premium over-ear wireless headphones engineered with hybrid active noise cancellation...",
    "shortDescription": "Hybrid ANC headphones with 45-hour battery life.",
    "price": 199.99,
    "compareAtPrice": 249.99,
    "discountPercentage": 20,
    "category": "Electronics",
    "brand": "AeroPulse",
    "stockQuantity": 42,
    "stockStatus": "IN_STOCK",
    "rating": 4.8,
    "reviewCount": 312,
    "images": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
    ],
    "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    "tags": ["audio", "wireless", "noise-cancelling"],
    "dimensions": { "length": 18.5, "width": 8.2, "height": 20.0, "unit": "cm" },
    "weight": { "value": 0.28, "unit": "kg" },
    "isFeatured": true,
    "isNewArrival": false,
    "isOnSale": true,
    "isBestSeller": true,
    "isLimitedEdition": false,
    "hasFreeShipping": true,
    "requiresAgeVerification": false,
    "allowCustomerReviews": true,
    "canReturn": true,
    "displayBadge": "BESTSELLER",
    "deliveryType": "EXPRESS",
    "status": "active"
  }
}
```

---

### 3. POST /api/products (Create Product)

Create a brand new product document.

#### Example Request:
```http
POST /api/products HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "Horizon OLED 34-Inch Curved Gaming Monitor",
  "sku": "DISP-HZ-026",
  "description": "Ultra-wide 34-inch QD-OLED 175Hz curved display with 0.03ms response time and HDR True Black 400 certification.",
  "shortDescription": "34-inch QD-OLED 175Hz 0.03ms curved gaming monitor.",
  "price": 899.99,
  "compareAtPrice": 1099.99,
  "category": "Gaming",
  "brand": "HorizonDisplay",
  "stockQuantity": 15,
  "thumbnail": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
  "images": [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"
  ],
  "tags": ["monitor", "oled", "gaming", "curved", "ultrawide"],
  "dimensions": { "length": 81.3, "width": 30.6, "height": 52.4, "unit": "cm" },
  "weight": { "value": 7.5, "unit": "kg" },
  "isFeatured": true,
  "isNewArrival": true,
  "hasFreeShipping": true,
  "displayBadge": "HOT",
  "deliveryType": "EXPRESS"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Horizon OLED 34-Inch Curved Gaming Monitor",
    "sku": "DISP-HZ-026",
    "description": "Ultra-wide 34-inch QD-OLED 175Hz curved display with 0.03ms response time.",
    "shortDescription": "34-inch QD-OLED 175Hz curved gaming monitor.",
    "price": 899.99,
    "compareAtPrice": 1099.99,
    "category": "Gaming",
    "brand": "HorizonDisplay",
    "stockQuantity": 15,
    "thumbnail": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    "tags": ["monitor", "oled", "gaming"],
    "isFeatured": true,
    "isNewArrival": true,
    "hasFreeShipping": true,
    "displayBadge": "HOT"
  }'
```

#### Example Response (201 Created):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "673cb0f191f098001234abcd",
    "name": "Horizon OLED 34-Inch Curved Gaming Monitor",
    "sku": "DISP-HZ-026",
    "description": "Ultra-wide 34-inch QD-OLED 175Hz curved display with 0.03ms response time and HDR True Black 400 certification.",
    "shortDescription": "34-inch QD-OLED 175Hz 0.03ms curved gaming monitor.",
    "price": 899.99,
    "compareAtPrice": 1099.99,
    "discountPercentage": 18,
    "category": "Gaming",
    "brand": "HorizonDisplay",
    "stockQuantity": 15,
    "stockStatus": "IN_STOCK",
    "rating": 0,
    "reviewCount": 0,
    "images": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"
    ],
    "thumbnail": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    "tags": ["monitor", "oled", "gaming", "curved", "ultrawide"],
    "dimensions": { "length": 81.3, "width": 30.6, "height": 52.4, "unit": "cm" },
    "weight": { "value": 7.5, "unit": "kg" },
    "isFeatured": true,
    "isNewArrival": true,
    "isOnSale": true,
    "isBestSeller": false,
    "isLimitedEdition": false,
    "hasFreeShipping": true,
    "requiresAgeVerification": false,
    "allowCustomerReviews": true,
    "canReturn": true,
    "displayBadge": "HOT",
    "deliveryType": "EXPRESS",
    "status": "active",
    "createdAt": "2026-11-19T04:12:00.000Z",
    "updatedAt": "2026-11-19T04:12:00.000Z"
  }
}
```

---

### 4. PUT /api/products/:id (Full Replacement)

Replaces an existing product completely. Requires all mandatory product fields.

#### Example Request:
```http
PUT /api/products/673cae0291f098001234abcd HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "AeroPulse Wireless ANC Headphones V2",
  "sku": "AUDIO-AP-001",
  "description": "Second generation active noise-cancelling headphones upgraded with custom beryllium acoustic drivers and Bluetooth 5.4.",
  "shortDescription": "Gen-2 ANC headphones with 50-hour battery and Bluetooth 5.4.",
  "price": 219.99,
  "compareAtPrice": 269.99,
  "category": "Electronics",
  "brand": "AeroPulse",
  "stockQuantity": 30,
  "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
  "tags": ["audio", "wireless", "v2"],
  "isFeatured": true,
  "hasFreeShipping": true,
  "displayBadge": "NEW"
}
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "message": "Product replaced successfully (PUT)",
  "data": {
    "_id": "673cae0291f098001234abcd",
    "name": "AeroPulse Wireless ANC Headphones V2",
    "sku": "AUDIO-AP-001",
    "price": 219.99,
    "compareAtPrice": 269.99,
    "discountPercentage": 19,
    "isOnSale": true,
    "stockStatus": "IN_STOCK",
    "displayBadge": "NEW",
    "updatedAt": "2026-11-19T04:15:00.000Z"
  }
}
```

---

### 5. PATCH /api/products/:id (Partial Update)

Updates only the specific fields provided in the request body. Automatically re-evaluates conditional flags like `stockStatus` or `isOnSale`.

#### Example Request (Update price and toggle featured):
```http
PATCH /api/products/673cae0291f098001234abcd HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "price": 179.99,
  "isFeatured": false,
  "displayBadge": "SALE"
}
```

#### Example cURL:
```bash
curl -X PATCH http://localhost:5000/api/products/673cae0291f098001234abcd \
  -H "Content-Type: application/json" \
  -d '{
    "price": 179.99,
    "displayBadge": "SALE"
  }'
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "message": "Product partially updated successfully (PATCH)",
  "data": {
    "_id": "673cae0291f098001234abcd",
    "name": "AeroPulse Wireless Noise-Cancelling Headphones",
    "sku": "AUDIO-AP-001",
    "price": 179.99,
    "compareAtPrice": 249.99,
    "discountPercentage": 28,
    "isOnSale": true,
    "isFeatured": false,
    "displayBadge": "SALE",
    "updatedAt": "2026-11-19T04:18:22.000Z"
  }
}
```

---

### 6. DELETE /api/products/:id (Delete Product)

Permanently removes a product from the database.

#### Example Request:
```http
DELETE /api/products/673cae0291f098001234abcd HTTP/1.1
Host: localhost:5000
Accept: application/json
```

#### Example cURL:
```bash
curl -X DELETE http://localhost:5000/api/products/673cae0291f098001234abcd
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "message": "Product 'AeroPulse Wireless Noise-Cancelling Headphones' (AUDIO-AP-001) was deleted successfully",
  "data": {
    "id": "673cae0291f098001234abcd",
    "sku": "AUDIO-AP-001",
    "name": "AeroPulse Wireless Noise-Cancelling Headphones"
  }
}
```

---

### 7. GET /api/products/meta/summary

Returns aggregate summary of categories, brands, and badge statistics.

#### Example Request:
```http
GET /api/products/meta/summary HTTP/1.1
Host: localhost:5000
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "data": {
    "totalCategories": 7,
    "categories": [
      "Apparel & Fashion",
      "Beauty & Personal Care",
      "Computers & Accessories",
      "Electronics",
      "Gaming",
      "Home & Kitchen",
      "Sports & Fitness"
    ],
    "totalBrands": 21,
    "brands": [
      "AeroDrone",
      "AeroPulse",
      "BrewMaster",
      "CyberBlade",
      "HyperDrive",
      "NovaFit",
      "TitanVortex"
    ],
    "badgeSummary": [
      { "badge": "BESTSELLER", "count": 7 },
      { "badge": "HOT", "count": 6 },
      { "badge": "LIMITED", "count": 4 },
      { "badge": "NEW", "count": 4 },
      { "badge": "SALE", "count": 2 }
    ]
  }
}
```

---

## Frontend Conditional Rendering Code Examples

Here is how you can use the conditional rendering keys directly in a React / JSX component:

```jsx
import React from 'react';

function ProductCard({ product }) {
  return (
    <div className={`product-card ${product.isFeatured ? 'border-2 border-amber-500 shadow-xl' : 'shadow-md'}`}>
      
      {/* 1. BADGES CONDITIONAL RENDERING */}
      <div className="badge-container">
        {product.isNewArrival && <span className="badge badge-green">NEW</span>}
        {product.isOnSale && <span className="badge badge-red">SALE -{product.discountPercentage}%</span>}
        {product.isBestSeller && <span className="badge badge-gold">★ BESTSELLER</span>}
        {product.isLimitedEdition && <span className="badge badge-purple">LIMITED EDITION</span>}
      </div>

      {/* 2. THUMBNAIL */}
      <img src={product.thumbnail} alt={product.name} className="product-image" />

      {/* 3. PRODUCT INFO */}
      <h3 className="product-title">{product.name}</h3>
      <p className="product-brand text-gray-500">{product.brand}</p>

      {/* 4. PRICE WITH CONDITIONAL STRIKE-THROUGH */}
      <div className="price-container">
        <span className="current-price text-xl font-bold">${product.price.toFixed(2)}</span>
        {product.isOnSale && product.compareAtPrice && (
          <span className="original-price line-through text-gray-400 ml-2">
            ${product.compareAtPrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* 5. STOCK STATUS WARNINGS */}
      {product.stockStatus === 'OUT_OF_STOCK' && (
        <div className="alert alert-danger">Out of Stock</div>
      )}
      {product.stockStatus === 'LOW_STOCK' && (
        <div className="alert alert-warning">Only {product.stockQuantity} left in stock - order soon!</div>
      )}

      {/* 6. FREE SHIPPING BADGE */}
      {product.hasFreeShipping && (
        <div className="free-shipping text-green-600 flex items-center">
          <TruckIcon className="w-4 h-4 mr-1" /> Free Delivery
        </div>
      )}

      {/* 7. AGE VERIFICATION NOTICE */}
      {product.requiresAgeVerification && (
        <div className="age-notice text-xs text-orange-600">
          ⚠️ 18+ Verification required upon delivery
        </div>
      )}

      {/* 8. CONDITIONAL ACTION BUTTONS */}
      <div className="card-actions mt-4">
        {product.stockStatus === 'OUT_OF_STOCK' ? (
          <button disabled className="btn btn-disabled">Sold Out</button>
        ) : (
          <button className="btn btn-primary">Add to Cart</button>
        )}

        {/* 9. RETURN GUARANTEE */}
        {product.canReturn && (
          <span className="text-xs text-gray-400 block mt-1">✓ 30-day money-back guarantee</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
```
