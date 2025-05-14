import { Router } from 'express';
import { getHomePage, postSabzi } from '../controllers/sabziController.js';

const router = Router();

/**
 * @route GET /get-ingredients
 * @desc Get home page of Sabzi API
 */
router.get('/', getHomePage);

/**
 * @route POST /get-ingredients
 * @desc Get ingredients for a sabzi using AI
 * @body {sabziName} - Name of the sabzi
 */
router.post('/', postSabzi);

export default router;