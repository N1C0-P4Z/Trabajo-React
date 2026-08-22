import { Router } from 'express';
import { receiptController } from '../../controllers/receipt.controller';

const router = Router();

router.get('/preview', receiptController.preview);

export default router;
