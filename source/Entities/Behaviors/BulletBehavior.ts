import { BULLET } from '@/constants';
import Behavior from './Behavior';
import EntitiesContainer from '@/Entities/EntitiesContainer';

export default class BulletBehavior implements Behavior {
  container: EntitiesContainer;
  lifeTimeRemaining: number;
  lifeTimeExpiredCallback?: () => void;

  constructor(container: EntitiesContainer) {
    this.container = container;
    this.lifeTimeRemaining = BULLET.LIFE_TIME;
    this.lifeTimeExpiredCallback = undefined;
  }

  setLifeTimeExpiredCallback = (callback: () => void) => this.lifeTimeExpiredCallback = callback;

  update(delta: number) {
    this.lifeTimeRemaining -= delta;
    if (this.lifeTimeRemaining <= 0 && this.lifeTimeExpiredCallback) {
      this.lifeTimeExpiredCallback();
    }
  }
}
