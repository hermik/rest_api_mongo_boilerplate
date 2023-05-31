import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/item';

const createNew = async (req: Request, res: Response, next: NextFunction) => {
	const { name, subscribedTo } = req.body;
	const item = new Item({
		_id: new mongoose.Types.ObjectId(),
		name,
		subscribedTo
	});
	return await item
		.save()
		.then((item) => res.status(201).json({ item }))
		.catch((error) => res.status(500).json({ error }));
};
const getByID = (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	Item.findById(id)
		.then((item) => res.status(201).json({ item }))
		.catch((error) => res.status(500).json({ error }));
};
const readAll = (req: Request, res: Response, next: NextFunction) => {
	Item.find()
		.then((item) => res.status(201).json({ item }))
		.catch((error) => res.status(500).json({ error }));
};
const updateByID = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	return await Item.findById(id).then((item) => {
		if (item) {
			item.set(req.body);
			return item
				.save()
				.then((item) => res.status(201).json({ item }))
				.catch((error) => res.status(500).json({ error }));
		}
	});
};
const deleteByID = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	return await Item.findByIdAndDelete(id).then((item) => (item ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'not found' })));
};

export default { createNew, getByID, readAll, deleteByID, updateByID };
