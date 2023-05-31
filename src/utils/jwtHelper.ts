import jwt, { Secret } from 'jsonwebtoken';

const signAccessToken = (payload: object) => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as Secret);
