import { EVENT_TYPES } from '@/constants';
import { Entity } from './Entities/Entity';

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

  onPublish(eventType: EVENT_TYPES, entity: Entity) {
    this.subscribers.forEach(subscriber => subscriber(eventType, entity));
  }
}

const eventChannel = new EventChannel();
export { eventChannel };
