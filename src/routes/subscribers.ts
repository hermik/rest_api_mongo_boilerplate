import express, { NextFunction, Request, Response } from 'express';
import controller from '../controllers/subscriber';

const router = express.Router();

router.get('/', controller.readAllAuthor);
router.get('/:id', controller.readAuthor);
router.delete('/:id', controller.deleteAuthor);
router.post('/create', controller.createAuthor);
router.patch('/:id', controller.updateAuthor);

export default router;
