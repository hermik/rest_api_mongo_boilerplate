import express, { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { IUser } from '../interfaces/user';
import Logger from '../libs/Logger';
export const Authenticate = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (error, user: any) => {
		let handleError = {};
		if (JSON.stringify(error) === '{}') {
			handleError = {
				message: 'JWT Verify error unknown.',
				name: 'JWTVerifyError'
			};
		}
		if (error) {
			console.log(error);
			Logger.error(error);
			let jsonError = JSON.stringify(handleError) === '{}' ? handleError : error;
			return res.status(403).json({ user, jsonError });
		}

		req.user = user;
		next();
	});
};

export const generateAccessToken = (user: IUser) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: process.env.ACCESS_TOKEN_TTL });
};

/**
 * Middleware for groups restriction
 * @param groups
 * @returns
 */
export const RestricedPermissions = (groups: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		let userGroups = req.user.roles;
		let access = false;
		for (let i = 0; i < userGroups.length; i++) {
			if (!(groups.indexOf(userGroups[i]) < 0)) {
				access = true;
				break;
			}
		}

		return access ? next() : res.status(403).json({ error: 'Permission denied' });
	};
};
