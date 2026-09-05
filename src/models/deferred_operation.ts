import mongoose, { Document, Schema } from 'mongoose';

export type DeferredOperationStatus = 'pending' | 'processing' | 'cancelled' | 'completed';
export type DeferredOperationType = 'delete-item';

export interface IDeferredOperation {
	itemId: string;
	type: DeferredOperationType;
	status: DeferredOperationStatus;
}

export interface IDeferredOperationModel extends IDeferredOperation, Document {}

const deferredOperationSchema: Schema = new Schema(
	{
		itemId: {
			type: String,
			required: true,
			index: true
		},
		type: {
			type: String,
			required: true,
			enum: ['delete-item']
		},
		status: {
			type: String,
			required: true,
			enum: ['pending', 'processing', 'cancelled', 'completed'],
			default: 'pending',
			index: true
		}
	},
	{
		timestamps: true
	}
);

export default mongoose.model<IDeferredOperationModel>('DeferredOperation', deferredOperationSchema);
