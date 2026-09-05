import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import Logger from '../libs/Logger';
import DeferredOperation from '../models/deferred_operation';
import Item from '../models/item';
import { DeleteItemJobData, ITEM_QUEUE_NAME } from '../queues/item.queue';

export const itemWorker = new Worker<DeleteItemJobData>(
	ITEM_QUEUE_NAME,
	async (job) => {
		if (job.name !== 'delete-item') {
			return;
		}

		const operation = await DeferredOperation.findOneAndUpdate(
			{
				_id: job.data.operationId,
				status: 'pending'
			},
			{
				$set: { status: 'processing' }
			},
			{
				new: true
			}
		);

		if (!operation) {
			const currentOperation = await DeferredOperation.findById(job.data.operationId);
			Logger.info(`Delayed delete skipped for operation ${job.data.operationId} - status ${currentOperation?.status || 'not-found'}`);
			return;
		}

		try {
			const deletedItem = await Item.findByIdAndDelete(operation.itemId);
			operation.status = 'completed';
			await operation.save();

			if (deletedItem) {
				Logger.info(`Delayed delete completed for item ${operation.itemId}, operation ${operation.id}`);
			} else {
				Logger.info(`Delayed delete completed without item - item ${operation.itemId} not found, operation ${operation.id}`);
			}
		} catch (error) {
			operation.status = 'pending';
			await operation.save();
			throw error;
		}
	},
	{
		connection: redisConnection
	}
);

itemWorker.on('failed', (job, error) => {
	Logger.error(`Item queue job ${job?.id || 'unknown'} failed: ${error.message}`);
});
