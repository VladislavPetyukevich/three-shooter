import { Vector3 } from 'three';
import InvisPhysicsSphere from '../../Physics/InvisPhysicsSphere';
import Actor from './Actor';

const WALK_SPEED = 25;

export default class PlayerActor extends Actor {
  constructor(position) {
    const sphereRadius = 1.3;
    const sphereMass = 10;
    super({
      hp: 100,
      solidBody: new InvisPhysicsSphere(
        sphereRadius, position, sphereMass, new Vector3(0, 10, 0)
      ),
      walkSpeed: WALK_SPEED
    });

    this.solidBody.body.linearDamping = 0.9;
  }

  update(delta) {
    super.update(delta);
  }
}
