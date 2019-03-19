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

  onPublish(eventType, target) {
    this.subscribers.forEach(subscriber => subscriber(eventType, target));
  }
}

export default new EventChannel();
