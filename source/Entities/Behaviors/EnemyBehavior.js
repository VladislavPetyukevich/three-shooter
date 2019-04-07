import { Vec3 } from 'cannon';

export default class EnemyBehavior {
  constructor(actor, playerBody) {
    this.actor = actor;
    this.playerBody = playerBody;
  }

  update(delta) {
    const direction = new Vec3();
    this.playerBody.position.vsub(this.actor.solidBody.body.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.actor.solidBody.body.quaternion.setFromVectors(forward, direction);
    direction.mult(this.actor.walkSpeed, this.actor.solidBody.body.velocity);
  }
}
