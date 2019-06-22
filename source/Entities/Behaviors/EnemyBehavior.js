import { Vec3 } from 'cannon';

export default class EnemyBehavior {
  constructor(actor, walkSpeed, playerBody, container, onShoot) {
    this.actor = actor;
    this.walkSpeed = walkSpeed;
    this.playerBody = playerBody;
    this.gun = container.createEntity(
      'Gun',
      { holderBody: this.actor.solidBody.body }
    );
    this.nextShootInterval = 3;
    this.lastShootSince = 0;
    this.onShoot = onShoot;
  }

  update(delta) {
    const direction = new Vec3();
    this.playerBody.position.vsub(this.actor.solidBody.body.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.actor.solidBody.body.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.actor.solidBody.body.velocity);

    this.lastShootSince += delta;
    if (this.lastShootSince >= this.nextShootInterval) {
      this.lastShootSince = 0;
      this.gun.shoot(direction);
      this.onShoot();
    }
  }
}
