import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import Logger from '../libs/Logger';
import Item from '../models/item';
import { DeleteItemJobData, ITEM_QUEUE_NAME } from '../queues/item.queue';

export const itemWorker = new Worker<DeleteItemJobData>(
	ITEM_QUEUE_NAME,
	async (job) => {
		if (job.name !== 'delete-item') {
			return;
		}

		const deletedItem = await Item.findByIdAndDelete(job.data.itemId);
		if (deletedItem) {
			Logger.info(`Delayed delete completed for item ${job.data.itemId}`);
		} else {
			Logger.info(`Delayed delete skipped - item ${job.data.itemId} not found`);
		}
	},
	{
		connection: redisConnection
	}
);

itemWorker.on('failed', (job, error) => {
	Logger.error(`Item queue job ${job?.id || 'unknown'} failed: ${error.message}`);
});
