export class SimpleEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  off(eventName, listener) {
    const set = this.listeners.get(eventName);
    if (!set) {
      return;
    }
    set.delete(listener);
    if (set.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) {
      return;
    }
    for (const listener of set) {
      listener(payload);
    }
  }
}
