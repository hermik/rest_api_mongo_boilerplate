import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/item';
import { getDeleteItemJobId, itemQueue, scheduleItemDeletion } from '../queues/item.queue';

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

	try {
		const item = await Item.findById(id);
		if (!item) {
			return res.status(404).json({ message: 'not found' });
		}

		const job = await scheduleItemDeletion(id);
		return res.status(202).json({
			message: 'delete scheduled',
			itemId: id,
			jobId: job.id,
			undoWithinMs: 5000
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

const undoDeleteByID = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;

	try {
		const job = await itemQueue.getJob(getDeleteItemJobId(id));
		if (!job) {
			return res.status(409).json({ message: 'delete cannot be undone' });
		}

		const state = await job.getState();
		if (state !== 'delayed' && state !== 'waiting') {
			return res.status(409).json({ message: 'delete cannot be undone', state });
		}

		await job.remove();
		return res.status(200).json({ message: 'delete cancelled', itemId: id });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export default { createNew, getByID, readAll, deleteByID, undoDeleteByID, updateByID };
