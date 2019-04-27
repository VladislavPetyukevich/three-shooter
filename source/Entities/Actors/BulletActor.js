import { SphereGeometry, MeshBasicMaterial } from 'three';
import Actor from './Actor';
import PhysicsBall from '../../Physics/PhysicsBall';

const BULLET_MASS = 5;
const SHAPE_RADIUS = 0.3;
const COLOR = 'red';

export default class BulletActor extends Actor {
  constructor(position) {
    const solidBody = new PhysicsBall(
      new SphereGeometry(SHAPE_RADIUS, 8, 8),
      new MeshBasicMaterial({ color: COLOR }),
      position,
      BULLET_MASS
    );

    super({
      hp: 1,
      solidBody
    });

    this.solidBody.body.isBullet = true;
  }
}
