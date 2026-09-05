import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/item';
import DeferredOperation from '../models/deferred_operation';
import { ITEM_DELETE_DELAY_MS, scheduleItemDeletion } from '../queues/item.queue';

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

		const existingOperation = await DeferredOperation.findOne({
			itemId: id,
			type: 'delete-item',
			status: { $in: ['pending', 'processing'] }
		}).sort({ createdAt: -1 });

		if (existingOperation) {
			return res.status(409).json({
				message: 'delete already scheduled',
				itemId: id,
				operationId: existingOperation.id,
				status: existingOperation.status
			});
		}

		const operation = await DeferredOperation.create({
			itemId: id,
			type: 'delete-item',
			status: 'pending'
		});

		try {
			const job = await scheduleItemDeletion(operation.id);
			return res.status(202).json({
				message: 'delete scheduled',
				itemId: id,
				operationId: operation.id,
				jobId: job.id,
				status: operation.status,
				undoWithinMs: ITEM_DELETE_DELAY_MS
			});
		} catch (error) {
			operation.status = 'cancelled';
			await operation.save();
			throw error;
		}
	} catch (error) {
		return res.status(500).json({ error });
	}
};

const undoDeleteByID = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;

	try {
		const operation = await DeferredOperation.findOneAndUpdate(
			{
				itemId: id,
				type: 'delete-item',
				status: 'pending'
			},
			{
				$set: { status: 'cancelled' }
			},
			{
				new: true,
				sort: { createdAt: -1 }
			}
		);

		if (operation) {
			return res.status(200).json({
				message: 'delete cancelled',
				itemId: id,
				operationId: operation.id,
				status: operation.status
			});
		}

		const latestOperation = await DeferredOperation.findOne({
			itemId: id,
			type: 'delete-item'
		}).sort({ createdAt: -1 });

		return res.status(409).json({
			message: 'delete cannot be undone',
			itemId: id,
			status: latestOperation?.status || 'not-found'
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export default { createNew, getByID, readAll, deleteByID, undoDeleteByID, updateByID };
