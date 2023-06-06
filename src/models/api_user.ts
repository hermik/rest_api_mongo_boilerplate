import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';
// /**
//  * Interface definition
//  */
// export interface IItem {
// 	name: string;
// 	password: string;
// }
export interface IApiUser extends Document {}

/**
 * create mongoose schema
 */
const UserSchema: Schema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	roles: {
		type: [String],
		required: true
	},
	created_at: {
		type: Date,
		required: true,
		default: Date.now
	}
});

export default mongoose.model<IApiUser>('User', UserSchema);
