import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const ITEM_QUEUE_NAME = 'items';
export const ITEM_DELETE_DELAY_MS = 5000;

export interface DeleteItemJobData {
	operationId: string;
}

export const itemQueue = new Queue<DeleteItemJobData>(ITEM_QUEUE_NAME, {
	connection: redisConnection
});

export const getDeleteItemJobId = (operationId: string) => `delete-item-${operationId}`;

export const scheduleItemDeletion = (operationId: string) =>
	itemQueue.add(
		'delete-item',
		{ operationId },
		{
			delay: ITEM_DELETE_DELAY_MS,
			jobId: getDeleteItemJobId(operationId),
			removeOnComplete: true,
			removeOnFail: 100
		}
	);
