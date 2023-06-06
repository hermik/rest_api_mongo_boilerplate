import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
/* middlewares  for authentication */
import { generateAccessToken } from '../middleware/authenticate';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/api_user';
import Logger from '../libs/Logger';

import { IUser } from '../interfaces/user';

/**
 * Create new Api user
 * @param req
 * @param res
 * @param next
 * @returns
 */
const createNew = async (req: Request, res: Response, next: NextFunction) => {
	//let passwordHash = User.setPassword(req.body.password);
	const item = new User(req.body);
	//User.password = passwordHash;
	return await item
		.save()
		.then((item: any) => res.status(201).json({ item }))
		.catch((error: any) => {
			Logger.error(error);
			return res.status(500).json({ error });
		});
};

/**
 * Get user by id
 * @param req
 * @param res
 * @param next
 */
const getByID = (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	User.findById(id)
		.then((item: any) => res.status(201).json({ item }))
		.catch((error: any) => {
			Logger.error(error);
			return res.status(500).json({ error });
		});
};

/**
 * Fetch all users
 * @param req
 * @param res
 * @param next
 */
const readAll = (req: Request, res: Response, next: NextFunction) => {
	User.find()
		.then((item: any) => res.status(201).json({ item }))
		.catch((error: any) => {
			Logger.error(error);
			return res.status(500).json({ error });
		});
};

/**
 * Update user by id
 * @param req
 * @param res
 * @param next
 * @returns
 */
const updateByID = async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	return await User.findById(id).then((item: any) => {
		if (item) {
			item.set(req.body);
			return item
				.save()
				.then((item: any) => res.status(201).json({ item }))
				.catch((error: any) => {
					Logger.error(error);
					return res.status(500).json({ error });
				});
		}
	});
};

/**
 * Remove user by ID
 * @param req
 * @param res
 * @param next
 * @returns
 */
const deleteByID = async (req: Request, res: Response) => {
	const id = req.params.id;
	return await User.findByIdAndDelete(id).then((item: any) => (item ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'not found' })));
};

/**
 * Login authentication - requires mongodb access
 * @param req
 * @param res
 */
const loginUser = (req: Request, res: Response, next: NextFunction) => {
	//@TODO: add authentcation from mongo db
	const username = req.body.username;
	const message = 'Welcome, ' + username + '!';
	const user = { username, roles: ['admin'] } as IUser;
	req.logInfo = username;
	//sign JWT
	const accessToken = generateAccessToken(user);
	const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as Secret);
	//refreshTokens.push(refreshToken);
	res.status(200).json({ message, user, accessToken, refreshToken });
};

export default { createNew, getByID, readAll, deleteByID, updateByID, loginUser };
