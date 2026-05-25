// models/SubCategory.js

import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    unique: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  description: {
    type: String
  },

  image: {
    type: String
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }

}, {
  timestamps: true
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

export default SubCategory;