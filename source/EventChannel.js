class EventChannel {
  constructor() {
    this.subscribers = [];
  }

  addSubscriber(subscriber) {
    this.subscribers.push(subscriber);
  }

  removeSubscriber(subscriber) {
    this.subscribers = this.subscribers.filter(ownsubscriber => ownsubscriber !== subscriber);
  }

  onPublish(eventType, payload) {
    this.subscribers.forEach(subscriber => subscriber(eventType, payload));
  }
}

export default new EventChannel();
