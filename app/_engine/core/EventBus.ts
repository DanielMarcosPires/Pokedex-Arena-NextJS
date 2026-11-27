export type EventMap = Record<string, unknown>;

export type EventHandler<Payload = unknown> = (payload: Payload) => void;

export class EventBus<Events extends EventMap = Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<EventHandler<any>>>();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }

    set.add(handler);

    // Retorna uma função de limpeza pronta para usar em useEffect ou destroy()
    return () => {
      this.off(event, handler);
    };
  }

  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    const wrapper: EventHandler<Events[K]> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };

    return this.on(event, wrapper);
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(
    ...args: Events[K] extends undefined ? [event: K] : [event: K, payload: Events[K]]
  ): void {
    const [event, payload] = args;
    const set = this.listeners.get(event);
    if (!set) return;

    for (const handler of set) {
      handler(payload);
    }
  }

  clear(event?: keyof Events): void {
    if (event !== undefined) {
      this.listeners.delete(event);
      return;
    }
    this.listeners.clear();
  }
}