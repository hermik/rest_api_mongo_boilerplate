import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

export const NeedDB = (req: Request, res: Response, next: NextFunction) => {
	if (mongoose.connection.readyState != 1) return res.status(500).json({ error: 'Temporary unavailable. #001' });

	next();
};
