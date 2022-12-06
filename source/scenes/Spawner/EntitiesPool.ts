import { Entity } from '@/core/Entities/Entity';

export class EntitiesPool {
  entities: Entity[];
  currentIndex: number;

  constructor(createCallback: () => Entity, count: number) {
    this.entities = Array.from({ length: count }, createCallback);
    this.currentIndex = 0;
  }

  getEntities(count: number) {
    return Array.from({ length: count }, () => this.getEntity());
  }

  getEntity() {
    if (this.currentIndex === this.entities.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
    return this.entities[this.currentIndex];
  }
};
