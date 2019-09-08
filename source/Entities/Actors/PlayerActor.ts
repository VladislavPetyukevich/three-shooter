import InvisPhysicsSphere from '@/SolidBody/InvisPhysicsSphere';
import Actor from '@/core/Entities/Actor';
import { PLAYER } from '@/constants';

export default class PlayerActor extends Actor {
  constructor(position = { x: 0, y: 0, z: 0 }) {
    const sphereRadius = PLAYER.SPHERE_RADIUS;
    const sphereMass = 10;
    super({
      solidBody: new InvisPhysicsSphere(
        sphereRadius, position, sphereMass
      )
    });

    this.solidBody.body!.linearDamping = 0.9;
  }

  update(delta: number) {
    super.update(delta);
  }
}
