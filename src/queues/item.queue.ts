import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const ITEM_QUEUE_NAME = 'items';
export const ITEM_DELETE_DELAY_MS = 5000;

export interface DeleteItemJobData {
	itemId: string;
}

export const itemQueue = new Queue<DeleteItemJobData>(ITEM_QUEUE_NAME, {
	connection: redisConnection
});

export const getDeleteItemJobId = (itemId: string) => `delete-item-${itemId}`;

export const scheduleItemDeletion = (itemId: string) =>
	itemQueue.add(
		'delete-item',
		{ itemId },
		{
			delay: ITEM_DELETE_DELAY_MS,
			jobId: getDeleteItemJobId(itemId),
			removeOnComplete: true,
			removeOnFail: 100
		}
	);
