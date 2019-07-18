import { Vector3 } from 'three';
import InvisPhysicsSphere from '../../Physics/InvisPhysicsSphere';
import Actor from './Actor';
import { PLAYER } from '../../constants';

export default class PlayerActor extends Actor {
  constructor(position) {
    const sphereRadius = PLAYER.SPHERE_RADIUS;
    const sphereMass = 10;
    super({
      solidBody: new InvisPhysicsSphere(
        sphereRadius, position, sphereMass
      )
    });

    this.solidBody.body.linearDamping = 0.9;
  }

  update(delta) {
    super.update(delta);
  }
}
