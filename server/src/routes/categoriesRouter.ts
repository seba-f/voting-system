import express from 'express';
import { getAllCategories, createCategory, deleteCategory } from '../controllers/categoriesController';

const router = express.Router();

// Category management routes
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
