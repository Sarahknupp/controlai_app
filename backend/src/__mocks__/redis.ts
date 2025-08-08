export class MockRedis {
  private store: Map<string, { value: any; expiry?: number }>;

  constructor() {
    this.store = new Map();
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: any, expiry?: number): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiry: expiry ? Date.now() + expiry * 1000 : undefined
    });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiry = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item || !item.expiry) return -1;
    const ttl = Math.ceil((item.expiry - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }
}

export default MockRedis; 