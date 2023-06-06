import express, { NextFunction, Request, Response } from 'express';
import controller from '../controllers/api_user';
/* middlewares  for authentication */
import { Authenticate, generateAccessToken, RestricedPermissions } from '../middleware/authenticate';
import { NeedDB } from '../middleware/need_db';
import jwt, { Secret } from 'jsonwebtoken';

const router = express.Router();
let refreshTokens: string[] = [];

/**
 * Get all records
 * Metgod: GET
 * Path: /api_user/create
 */
router.get('/', NeedDB, Authenticate, RestricedPermissions(['admin']), controller.readAll);

/**
 * Get by id
 * Metgod: GET
 * Path: /api_user/{id}
 */
router.get('/:id', NeedDB, Authenticate, RestricedPermissions(['admin']), controller.getByID);

/**
 * Remove by id
 * Method: DELETE
 * Path: /api_user/{id}
 */
router.delete('/:id', NeedDB, Authenticate, RestricedPermissions(['admin']), controller.deleteByID);

/**
 * Add new record
 * Method: POST
 * Path: /api_user/create
 */
router.post('/create', NeedDB, Authenticate, RestricedPermissions(['admin']), controller.createNew);

/**
 * Update record by id
 * Method: PATCH
 * Path: /api_user/{id}
 */
router.patch('/:id', NeedDB, Authenticate, RestricedPermissions(['admin']), controller.updateByID);

/** authentication */
router.post('/login', NeedDB, controller.loginUser);

router.post('/logout', Authenticate, (req: Request, res: Response) => {
	//refreshTokens = refreshTokens.filter((token) => token !== req.body.accessToken);
	res.sendStatus(204);
});
router.post('/refreshToken', Authenticate, (req: Request, res: Response) => {
	const refreshToken = req.body.token;
	if (refreshToken == null) return res.sendStatus(401);
	//if (refreshTokens.includes(refreshToken)) return res.sendStatus(401);
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret, (err: any, user: any) => {
		if (err) return res.status(403).json({ err });
		const accessToken = generateAccessToken(user);
		res.json({ accessToken });
	});
});

export default router;
