import express, { NextFunction, Request, Response } from 'express';
import { getObjectController, createObjectController, deleteObjectController, createObjectsBatchController } from '../controllers/objectController';
import { authenticateTenant } from '../middlewares/authenticateTenant';
import rateLimiter from '../middlewares/rateLimiter';
import { createTenantController } from '../controllers/tenantController';



const router = express.Router();

router.post('/tenant', createTenantController);
// Apply the middleware to routes that require authentication
router.use('/object', authenticateTenant);
router.use(rateLimiter);
router.get('/object/:key', getObjectController);
router.post('/object', createObjectController);
router.delete('/object/:key', deleteObjectController);
router.post('/object/batch', createObjectsBatchController);


export default router;
