export class MockRedis {
  private store: Map<string, string>;
  private ttlStore: Map<string, number>;

  constructor() {
    this.store = new Map();
    this.ttlStore = new Map();
  }

  async get(key: string): Promise<string | null> {
    const value = this.store.get(key);
    if (!value) return null;

    const ttl = this.ttlStore.get(key);
    if (ttl && ttl < Date.now()) {
      this.store.delete(key);
      this.ttlStore.delete(key);
      return null;
    }

    return value;
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (ttl) {
      this.ttlStore.set(key, Date.now() + ttl * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const exists = this.store.has(key);
    this.store.delete(key);
    this.ttlStore.delete(key);
    return exists ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.store.has(key)) return 0;
    this.ttlStore.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const ttl = this.ttlStore.get(key);
    if (!ttl) return -2;
    const remaining = Math.ceil((ttl - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    this.ttlStore.clear();
    return 'OK';
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }
}

export default MockRedis; 