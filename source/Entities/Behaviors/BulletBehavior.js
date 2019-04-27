const BULLET_LIFE_TIME = 5;

export default class BulletBehavior {
  constructor(container, lifeTimeExpiredCallback) {
    this.container = container;
    this.lifeTimeRemaining = BULLET_LIFE_TIME ;
    this.lifeTimeExpiredCallback = lifeTimeExpiredCallback;
  }

  update(delta) {
    this.lifeTimeRemaining -= delta;
    if (this.lifeTimeRemaining <= 0) {
      this.lifeTimeExpiredCallback();
    }
  }
}
