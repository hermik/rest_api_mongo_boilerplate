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
			return res.status(400).json({ error });
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
	let limit: number;
	// @ts-ignore
	limit = req.query.hasOwnProperty('_limit') ? parseInt(req.query._limit) : 0;
	// @ts-ignore
	let skip = req.query.hasOwnProperty('_page') ? req.query._page * req.query._limit - req.query._limit : 0;

	//produce find object for mongo. if q is passed use fulltext, otherwise
	//iterateh
	let find = {};
	if (req.query.hasOwnProperty('q') && req.query.q != '') {
		find = { $text: { $search: req.query.q } };
	} else {
		for (const [key, value] of Object.entries(req.query)) {
			if (User.schema.paths.hasOwnProperty(key)) {
				let regex = new RegExp('' + req.query[key] + '', 'i');
				//@ts-ignore
				find[key] = { $regex: regex };
			}
		}
	}

	User.find(find)
		.skip(skip)
		.limit(limit)
		.sort(getSortFromRequest(req))

		.exec(function (err, items) {
			User.count().exec(function (err, count) {
				let rowCount = count.toString();
				res.append('X-Total-Count', rowCount);
				if (err) {
					res.status(500).json(err);
					return;
				}
				res.status(200).json(items);
			});
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
	const ids = id.split(',');
	const filter = { _id: { $in: ids } };
	return await User.deleteMany(filter).then((item: any) => (item ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'not found' })));
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

const getSortFromRequest = (req: Request): any => {
	const order = req.query.hasOwnProperty('_order') && req.query._order == 'desc' ? -1 : 1;
	const sort = req.query.hasOwnProperty('_sort') ? req.query._sort : null;
	let sortarray = [sort, order];
	console.log(sortarray);
	return [sortarray];
};

export default { createNew, getByID, readAll, deleteByID, updateByID, loginUser };
