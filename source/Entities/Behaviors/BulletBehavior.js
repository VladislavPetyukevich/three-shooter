import { BULLET } from '../../constants';

export default class BulletBehavior {
  constructor(container, lifeTimeExpiredCallback) {
    this.container = container;
    this.lifeTimeRemaining = BULLET.LIFE_TIME;
    this.lifeTimeExpiredCallback = lifeTimeExpiredCallback;
  }

  update(delta) {
    this.lifeTimeRemaining -= delta;
    if (this.lifeTimeRemaining <= 0) {
      this.lifeTimeExpiredCallback();
    }
  }
}
