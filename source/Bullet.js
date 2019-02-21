import { Vector3, SphereGeometry, MeshBasicMaterial } from 'three';
import PhysicsBall from './Physics/PhysicsBall';

const MAX_LIFE_TIME = 5;

export default class Bullet extends PhysicsBall {
  constructor(shapeRadius = 0.3, position = new Vector3(0, 0, 0), mass = 5, color = 'red') {
    super(
      new SphereGeometry(shapeRadius, 8, 8),
      new MeshBasicMaterial({ color }),
      position,
      mass
    );
    this.lifeTimeRemaining = MAX_LIFE_TIME;
  }

  update(delta) {
    super.update();
    this.lifeTimeRemaining -= delta;
  }
}
