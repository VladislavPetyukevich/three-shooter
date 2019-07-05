import { Vec3 } from 'cannon';
import { toRadians } from '../../utils';
import { FLYING_ENEMY } from '../../constants';

const getXShift = angle => Math.cos(toRadians(angle)) * FLYING_ENEMY.SHAKE_DISTANCE;

export default class EnemyBehavior {
  constructor(actor, flyingSpeed, playerBody) {
    this.actor = actor;
    this.flyingSpeed = flyingSpeed;
    this.playerBody = playerBody;
    this.shakeAngle = 0;
  }

  update(delta) {
    const direction = new Vec3();
    const relativeVector = new Vec3(getXShift(this.shakeAngle), 0, this.flyingSpeed);
    const forward = new Vec3(0, 0, 1);
    this.playerBody.position.vsub(this.actor.solidBody.body.position, direction);
    if (this.actor.solidBody.body.position.y < FLYING_ENEMY.Y_POS) {
      direction.y += FLYING_ENEMY.Y_POS;
    }
    this.actor.solidBody.body.quaternion.vmult(relativeVector, relativeVector);
    this.actor.solidBody.body.quaternion.setFromVectors(forward, direction);
    relativeVector.vadd(relativeVector, this.actor.solidBody.body.velocity);

    this.shakeAngle += FLYING_ENEMY.SHAKE_SPEED;
    if (this.shakeAngle >= 360) {
      this.shakeAngle = 0;
    }
  }
}
