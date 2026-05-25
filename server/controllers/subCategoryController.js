// controllers/subCategoryController.js

import SubCategory from '../models/SubCategory.js';
import AdminActivityLog from '../models/AdminActivityLog.js';

// Slug Helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};



// GET ALL SUBCATEGORIES
export const getSubCategories = async (req, res, next) => {
  try {

    const subcategories = await SubCategory
      .find({})
      .populate('category', 'name');

    res.json({
      success: true,
      data: subcategories
    });

  } catch (error) {
    next(error);
  }
};




// ADD SUBCATEGORY
export const addSubCategory = async (req, res, next) => {

  const {
    name,
    description,
    image,
    category
  } = req.body;

  try {

    const exists = await SubCategory.findOne({ name });

    if (exists) {
      res.status(400);
      throw new Error('Subcategory already exists');
    }

    const subcategory = await SubCategory.create({
      name,
      slug: slugify(name),
      description,
      image: image || '/subcategory-placeholder.jpg',
      category
    });

    // Activity Log
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'ADD_SUBCATEGORY',
      details: `Added subcategory: ${name}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    next(error);
  }
};




// UPDATE SUBCATEGORY
export const updateSubCategory = async (req, res, next) => {

  try {

    let subcategory = await SubCategory.findById(req.params.id);

    if (!subcategory) {
      res.status(404);
      throw new Error('Subcategory not found');
    }

    const {
      name,
      description,
      image,
      category
    } = req.body;

    if (name) {
      subcategory.name = name;
      subcategory.slug = slugify(name);
    }

    if (description) {
      subcategory.description = description;
    }

    if (image) {
      subcategory.image = image;
    }

    if (category) {
      subcategory.category = category;
    }

    subcategory = await subcategory.save();

    // Activity Log
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'UPDATE_SUBCATEGORY',
      details: `Updated subcategory: ${subcategory.name}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    next(error);
  }
};




// DELETE SUBCATEGORY
export const deleteSubCategory = async (req, res, next) => {

  try {

    const subcategory = await SubCategory.findById(req.params.id);

    if (!subcategory) {
      res.status(404);
      throw new Error('Subcategory not found');
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    // Activity Log
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'DELETE_SUBCATEGORY',
      details: `Deleted subcategory: ${subcategory.name}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Subcategory removed successfully'
    });

  } catch (error) {
    next(error);
  }
};