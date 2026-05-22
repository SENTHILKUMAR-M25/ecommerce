import express from "express";
import {
  createOffer,
  getOffers,
  getActiveOffers,
  getOfferBySlug,
  toggleOffer,
  deleteOffer,
  updateOffer,
  getProductOffer,
} from "../controllers/offerController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin
router.post("/", protect, adminOnly, createOffer);
router.get("/", protect, adminOnly, getOffers);
router.put("/:id", protect, adminOnly, updateOffer);
router.delete("/:id", protect, adminOnly, deleteOffer);
router.put("/:id/toggle", protect, adminOnly, toggleOffer);

// Public (HOME PAGE / LISTING)
router.get("/active", getActiveOffers);
router.get("/slug/:slug", getOfferBySlug);
router.get("/product/:productId", getProductOffer);

export default router;