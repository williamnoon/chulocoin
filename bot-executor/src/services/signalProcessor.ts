import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Signal processing queue
export const signalQueue = new Queue('signals', { connection });

export interface SignalJob {
  signalId: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  target: number;
  confidence: number;
  userId: string;
  exchange: string;
}

/**
 * Add signal to processing queue
 */
export async function enqueueSignal(signalData: SignalJob) {
  await signalQueue.add('process-signal', signalData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  console.log(`✅ Signal ${signalData.signalId} enqueued for processing`);
}

/**
 * Create worker to process signals
 */
export function createSignalWorker(processor: (job: any) => Promise<void>) {
  const worker = new Worker('signals', processor, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', job => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
