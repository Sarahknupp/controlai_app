export class Queue {
  constructor(name: string) {
    this.name = name;
  }

  name: string;
  add = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
  process = jest.fn();
  getJob = jest.fn().mockResolvedValue({
    id: 'mock-job-id',
    data: {},
    progress: jest.fn(),
    finished: jest.fn(),
    failed: jest.fn()
  });
  getJobs = jest.fn().mockResolvedValue([]);
  getJobCounts = jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0
  });
  pause = jest.fn().mockResolvedValue(undefined);
  resume = jest.fn().mockResolvedValue(undefined);
  clean = jest.fn().mockResolvedValue([]);
  removeJobs = jest.fn().mockResolvedValue([]);
  close = jest.fn().mockResolvedValue(undefined);
}

export const QueueScheduler = jest.fn();
export const Worker = jest.fn();

export default {
  Queue,
  QueueScheduler,
  Worker
}; 