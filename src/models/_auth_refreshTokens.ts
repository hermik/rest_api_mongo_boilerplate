import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken {
	username: string;
	refreshToken: string;
	createdAt: string;
}

export interface IRefreshTokensModel extends IRefreshToken, Document {}

const refreshTokensSchema: Schema = new Schema({
	username: {
		type: String,
		required: true
	},
	refreshToken: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

export default mongoose.model<IRefreshTokensModel>('_auth_refreshTokens', refreshTokensSchema);
