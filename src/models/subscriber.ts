import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber {
	name: string;
}

export interface ISubscriberModel extends ISubscriber, Document {}

const subscribersSchema: Schema = new Schema({
	name: {
		type: String,
		required: true
	},
	subscribedTo: {
		type: String,
		required: true
	},
	subscribeDate: {
		type: Date,
		required: true,
		default: Date.now
	}
});

export default mongoose.model<ISubscriberModel>('Subscriber', subscribersSchema);
