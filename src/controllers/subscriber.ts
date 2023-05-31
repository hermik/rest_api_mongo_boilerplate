import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscriber from '../models/subscriber';

const createAuthor = async (req: Request, res: Response, next: NextFunction) => {
	const { name, subscribedTo } = req.body;
	const subscriber = new Subscriber({
		_id: new mongoose.Types.ObjectId(),
		name,
		subscribedTo
	});
	return await subscriber
		.save()
		.then((subscriber) => res.status(201).json({ subscriber }))
		.catch((error) => res.status(500).json({ error }));
};
const readAuthor = (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	Subscriber.findById(id)
		.then((subscriber) => res.status(201).json({ subscriber }))
		.catch((error) => res.status(500).json({ error }));
};
const readAllAuthor = (req: Request, res: Response, next: NextFunction) => {
	Subscriber.find()
		.then((subscriber) => res.status(201).json({ subscriber }))
		.catch((error) => res.status(500).json({ error }));
};
const updateAuthor = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	return await Subscriber.findById(id).then((subscriber) => {
		if (subscriber) {
			subscriber.set(req.body);
			return subscriber
				.save()
				.then((subscriber) => res.status(201).json({ subscriber }))
				.catch((error) => res.status(500).json({ error }));
		}
	});
};
const deleteAuthor = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	return await Subscriber.findByIdAndDelete(id).then((subscriber) => (subscriber ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'not found' })));
};

const fetchSubscriber = (req: Request, res: Response, next: NextFunction) => {
	const id = req.body.id;
	const subscriber = Subscriber.findById(id).catch((error) => res.status(500).json({ error }));
	if (subscriber == null) {
		return res.status(404).json({ message: 'Not found' });
	}

	//res.subscriber = subscriber;
	next();
};
export default { createAuthor, readAuthor, readAllAuthor, deleteAuthor, updateAuthor };
