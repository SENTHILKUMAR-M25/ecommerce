import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    banner: {
      type: String,
    },

    couponCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    type: {
      type: String,
      enum: ["coupon", "combo", "category", "seasonal", "product"],
      required: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    // PRODUCT BASED
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    // CATEGORY BASED
    category: String,

    // DATE CONTROL
    startDate: Date,
    endDate: Date,

    // RULES
    minPurchase: {
      type: Number,
      default: 0,
    },

    usageLimitPerUser: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);