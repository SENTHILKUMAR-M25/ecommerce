import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AdminActivityLog from '../models/AdminActivityLog.js';
import Offer from '../models/OfferSchema.js';
// Helper slugifier
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, subcategory, priceMin, priceMax, ratingMin, sort, page, limit } = req.query;

    const query = {};

    // 1. Keyword Text Search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 2. Category Filter
    if (category) {
      // Find category ID by slug or ID
      const cat = await Category.findOne({ $or: [{ slug: category }, { name: category }] });
      if (cat) {
        query.category = cat._id;
      }
    }

    // Subcategory Filter
    if (subcategory) {
      const SubCategory = mongoose.model('SubCategory');
      const subCat = await SubCategory.findOne({ $or: [{ slug: subcategory }, { name: subcategory }] });
      if (subCat) {
        query.subcategory = subCat._id;
      }
    }

    // 3. Price Filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // 4. Rating Filter
    if (ratingMin) {
      query.ratings = { $gte: Number(ratingMin) };
    }

    // 5. Sorting
    let sortBy = { createdAt: -1 }; // default newest
    if (sort) {
      if (sort === 'priceAsc') sortBy = { price: 1 };
      else if (sort === 'priceDesc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { ratings: -1 };
      else if (sort === 'oldest') sortBy = { createdAt: 1 };
    }

    // 6. Pagination
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 8;
    const skip = (currentPage - 1) * pageLimit;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(pageLimit);

    // 7. Attach Active Offers
    const now = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: null, endDate: null }
      ]
    });

    const productsWithOffers = products.map(product => {
      const pObj = product.toObject();
      const match = activeOffers
        .filter(o => 
          o.products.some(pId => pId.toString() === product._id.toString()) || 
          (o.category && o.category === product.category?.name)
        )
        .sort((a, b) => b.discountValue - a.discountValue)[0]; // Best discount
      
      pObj.activeOffer = match || null;
      return pObj;
    });

    res.json({
      success: true,
      count: products.length,
      totalProducts,
      pages: Math.ceil(totalProducts / pageLimit),
      currentPage,
      data: productsWithOffers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Attach best active offer
    const now = new Date();
    const activeOffer = await Offer.findOne({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: null, endDate: null }
      ],
      $or: [
        { products: product._id },
        { category: product.category?.name }
      ]
    }).sort({ discountValue: -1 });

    const productObj = product.toObject();
    productObj.activeOffer = activeOffer;

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const validateSizes = (sizes) => {
  if (!sizes || !sizes.length) return null;
  const seen = new Set();
  for (const s of sizes) {
    if (!s.size) return 'Each size must have a name';
    if (seen.has(s.size)) return `Duplicate size: ${s.size}`;
    if (!s.price || s.price <= 0) return `Price for size ${s.size} must be greater than 0`;
    if (s.stock < 0) return `Stock for size ${s.size} cannot be negative`;
    seen.add(s.size);
  }
  return null;
};

export const addProduct = async (req, res, next) => {
  const { name, description, price, compareAtPrice, category, subcategory, images, stock, variants, colorImages, isFeatured, isTrending, brand, brandPrices, sizes } = req.body;

  try {
    if (!category) {
      res.status(400);
      throw new Error('Category is required. Please select a category.');
    }

    // Verify the category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      res.status(404);
      throw new Error(`Category not found. Please select a valid category.`);
    }

    const slug = slugify(name) + '-' + Math.floor(1000 + Math.random() * 9000);

    const sizeError = validateSizes(sizes);
    if (sizeError) {
      res.status(400);
      throw new Error(sizeError);
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice,
      category: categoryDoc._id,
      subcategory: subcategory || null,
      images: images || ['/placeholder.jpg'],
      stock: stock || 0,
      variants: variants || [],
      sizes: sizes || [],
      brandPrices: brandPrices || [],
      brand: brand || null,
      colorImages: colorImages || [],
      isFeatured: !!isFeatured,
      isTrending: !!isTrending
    });

    // Log Activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'ADD_PRODUCT',
      details: `Added product: ${name} (${product._id})`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};


// export const updateProduct = async (req, res, next) => {
//   try {
//     let product = await Product.findById(req.params.id);

//     if (!product) {
//       res.status(404);
//       throw new Error('Product not found');
//     }

//     // If a category ObjectId is provided, verify it exists
//     if (req.body.category) {
//       const categoryDoc = await Category.findById(req.body.category);
//       if (!categoryDoc) {
//         res.status(404);
//         throw new Error(`Category not found. Please select a valid category.`);
//       }
//     }

//     if (req.body.name) {
//       req.body.slug = slugify(req.body.name) + '-' + Math.floor(1000 + Math.random() * 9000);
//     }

//     product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     // Log Activity
//     await AdminActivityLog.create({
//       admin: req.user._id,
//       action: 'UPDATE_PRODUCT',
//       details: `Updated product: ${product.name} (${product._id})`,
//       ipAddress: req.ip
//     });

//     res.json({
//       success: true,
//       data: product
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import mongoose from 'mongoose';

export const updateProduct = async (req, res, next) => {
  try {

    // ✅ Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ✅ Validate category
    if (req.body.category) {

      if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }

      const categoryDoc = await Category.findById(req.body.category);

      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // ✅ Validate sizes if provided
    if (req.body.sizes) {
      const sizeError = validateSizes(req.body.sizes);
      if (sizeError) {
        return res.status(400).json({ success: false, message: sizeError });
      }
    }

    // ✅ Generate new slug if name changed
    if (req.body.name) {
      req.body.slug =
        slugify(req.body.name) +
        '-' +
        Math.floor(1000 + Math.random() * 9000);
    }

    // ✅ Prevent empty subcategory
    if (req.body.subcategory === '') {
      req.body.subcategory = null;
    }

    // ✅ Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    // If request provides brandPrices or sizeOptions explicitly, make sure they're saved as arrays
    if (req.body.brandPrices || req.body.sizes || typeof req.body.brand !== 'undefined') {
      const updateFields = {};
      if (req.body.brandPrices) updateFields.brandPrices = req.body.brandPrices;
      if (req.body.sizes) updateFields.sizes = req.body.sizes;
      if (typeof req.body.brand !== 'undefined') updateFields.brand = req.body.brand;

      product = await Product.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug');
    }

    // ✅ Log admin activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'UPDATE_PRODUCT',
      details: `Updated product: ${product.name} (${product._id})`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: product
    });

  } catch (error) {

    console.log('UPDATE PRODUCT ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);

    // Log Activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'DELETE_PRODUCT',
      details: `Deleted product: ${product.name} (${product._id})`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
