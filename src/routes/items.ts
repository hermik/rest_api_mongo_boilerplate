import express from 'express';
import controller from '../controllers/item';

const router = express.Router();

router.get('/', controller.readAll);
router.get('/:id', controller.getByID);
router.delete('/:id', controller.deleteByID);
router.post('/:id/undo-delete', controller.undoDeleteByID);
router.post('/create', controller.createNew);
router.patch('/:id', controller.updateByID);

export default router;
