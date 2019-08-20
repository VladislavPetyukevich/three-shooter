import { EVENT_TYPES } from './constants';

class EventChannel {
  subscribers: Function[];

  constructor() {
    this.subscribers = [];
  }

  addSubscriber(subscriber: Function) {
    this.subscribers.push(subscriber);
  }

  removeSubscriber(subscriber: Function) {
    this.subscribers = this.subscribers.filter(ownsubscriber => ownsubscriber !== subscriber);
  }

  onPublish(eventType: EVENT_TYPES, payload: any) {
    this.subscribers.forEach(subscriber => subscriber(eventType, payload));
  }
}

export default new EventChannel();
