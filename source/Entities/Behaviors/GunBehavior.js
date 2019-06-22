import { Vector3 } from 'three';

export default class GunBehavior {
  constructor(holderBody, container, actor = undefined, camera = undefined) {
    this.holderBody = holderBody;
    this.container = container;
    this.actor = actor;
    this.camera = camera;
  }

  shoot = (direction) => {
    const shootVelocity = 70;
    const bulletShapeRadius = 0.3;
    const bulletPositionOffset = this.holderBody.shapes[0].boundingSphereRadius * 1.02 + bulletShapeRadius;
    const bulletPosition = new Vector3(
      this.holderBody.position.x + direction.x * bulletPositionOffset,
      this.holderBody.position.y + direction.y * bulletPositionOffset,
      this.holderBody.position.z + direction.z * bulletPositionOffset
    );
    bulletPosition.y -= 0.3 * 1.02;
    const bullet = this.container.createEntity(
      'Bullet',
      { position: bulletPosition }
    );
    bullet.actor.solidBody.body.velocity.set(
      direction.x * shootVelocity,
      direction.y * shootVelocity,
      direction.z * shootVelocity
    );
  }

  updateActorPosition() {
    this.actor.solidBody.mesh.position.copy(this.camera.position);
    this.actor.solidBody.mesh.position.y -= 0.3;
    this.actor.solidBody.mesh.position.z -= 0.3;
  }

  update() {
    if (this.camera && this.actor) {
      this.updateActorPosition();
    }
  }
}
