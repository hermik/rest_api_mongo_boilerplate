import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface definition
 */
export interface IItem {
	name: string;
}
export interface IItemModel extends IItem, Document {}

/**
 * create mongoose schema
 */
const itemSchema: Schema = new Schema({
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	available_at: {
		type: Date,
		required: true,
		default: Date.now
	}
});

export default mongoose.model<IItemModel>('Item', itemSchema);
