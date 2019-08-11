import { SphereGeometry, MeshBasicMaterial } from 'three';
import Actor from './Actor';
import PhysicsBall from '../../SolidBody/PhysicsBall';
import { BULLET } from '../../constants';

export default class BulletActor extends Actor {
  constructor(position) {
    const solidBody = new PhysicsBall(
      new SphereGeometry(BULLET.SHAPE_RADIUS, 8, 8),
      new MeshBasicMaterial({ color: BULLET.COLOR }),
      position,
      BULLET.MASS
    );

    super({
      solidBody
    });

    this.solidBody.body.isBullet = true;
  }
}
