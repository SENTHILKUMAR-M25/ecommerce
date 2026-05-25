import Offer from "../models/OfferSchema.js";

/**
 * @desc    CREATE OFFER
 * @route   POST /api/offers
 * @access  Private/Admin
 */
export const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      banner,
      type,
      discountType,
      discountValue,
      startDate,
      endDate,
      minPurchase,
      products,
      category,
      couponCode,
    } = req.body;

    // Validation
    if (!title || !slug || !discountType || !discountValue || !type) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (title, slug, discount, type)",
      });
    }

    // Clean up dates
    const safeStartDate = startDate ? new Date(startDate) : null;
    const safeEndDate = endDate ? new Date(endDate) : null;

    const offer = await Offer.create({
      title,
      slug,
      banner,
      type,
      discountType,
      discountValue: Number(discountValue),
      startDate: safeStartDate,
      endDate: safeEndDate,
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      products: Array.isArray(products) ? products : [],
      category,
      couponCode: couponCode || undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("OFFER_CREATE_ERROR:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Offer with this slug already exists",
      });
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    next(error);
  }
};

/**
 * @desc    GET SINGLE OFFER BY SLUG
 * @route   GET /api/offers/slug/:slug
 * @access  Public
 */
export const getOfferBySlug = async (req, res, next) => {
  try {
    let offer = await Offer.findOne({ slug: req.params.slug, isActive: true })
      .populate("products.product");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or expired",
      });
    }

    // Convert to object to add dynamic products if needed
    offer = offer.toObject();

    // If it's a category offer and no products are specifically tagged, 
    // fetch all products from that category
    if ((offer.type === 'category' || offer.category) && (!offer.products || offer.products.length === 0)) {
       const Product = (await import('../models/Product.js')).default;
       const Category = (await import('../models/Category.js')).default;
       
       // Find the category ID if we have a name
       let categoryId = offer.category;
       if (typeof offer.category === 'string') {
          const categoryDoc = await Category.findOne({ name: offer.category });
          if (categoryDoc) categoryId = categoryDoc._id;
       }

       const categoryProducts = await Product.find({ category: categoryId }).limit(20);
       offer.products = categoryProducts.map(p => ({ product: p, quantity: 1 }));
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET ALL OFFERS
 * @route   GET /api/offers
 * @access  Private/Admin
 */
export const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET ACTIVE OFFERS
 * @route   GET /api/offers/active
 * @access  Public
 */
export const getActiveOffers = async (req, res, next) => {
  try {
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: null, endDate: null }
      ]
    })
    .populate("products.product")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    TOGGLE OFFER STATUS
 * @route   PUT /api/offers/:id/toggle
 * @access  Private/Admin
 */
export const toggleOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.isActive = !offer.isActive;

    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${
        offer.isActive ? "activated" : "deactivated"
      } successfully`,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    DELETE OFFER
 * @route   DELETE /api/offers/:id
 * @access  Private/Admin
 */
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    UPDATE OFFER
 * @route   PUT /api/offers/:id
 * @access  Private/Admin
 */
export const updateOffer = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      banner,
      type,
      discountType,
      discountValue,
      startDate,
      endDate,
      minPurchase,
      products,
      category,
      couponCode,
    } = req.body;

    // Validation
    if (!title || !slug || !discountType || !discountValue || !type) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (title, slug, discount, type)",
      });
    }

    // Clean up dates
    const safeStartDate = startDate ? new Date(startDate) : null;
    const safeEndDate = endDate ? new Date(endDate) : null;

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        banner,
        type,
        discountType,
        discountValue: Number(discountValue),
        startDate: safeStartDate,
        endDate: safeEndDate,
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        products: Array.isArray(products) ? products : [],
        category,
        couponCode: couponCode || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("OFFER_UPDATE_ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Offer with this slug already exists",
      });
    }

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    next(error);
  }
};

/**
 * @desc    GET ACTIVE OFFER FOR A PRODUCT
 * @route   GET /api/offers/product/:productId
 * @access  Public
 */
export const getProductOffer = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const now = new Date();

    // Fetch the product to know its category
    const Product = (await import("../models/Product.js")).default;
    const Category = (await import("../models/Category.js")).default;
    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Find active offers
    // Priority: 1. Product Specific, 2. Category Based, 3. Seasonal (if tagged)
    const activeOffers = await Offer.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: null, endDate: null },
      ],
      $or: [
        { "products.product": productId },
        { category: product.category?.name },
      ],
    }).sort({ discountValue: -1 }); // Get best discount first

    res.status(200).json({
      success: true,
      data: activeOffers[0] || null,
    });
  } catch (error) {
    next(error);
  }
};