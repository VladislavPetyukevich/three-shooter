import { Vector3 } from 'three';
import { GUN } from '../../constants';

const PI_180 = Math.PI / 180;
const BOB_DISTANCE_Y = GUN.BOB_DISTANCE / 2;

const toRadians = degrees => degrees * PI_180;

const getGunXShift = angle => Math.cos(toRadians(angle)) * GUN.BOB_DISTANCE;
const getGunYShift = angle => Math.abs(Math.sin(toRadians(angle)) * BOB_DISTANCE_Y);

const isMiddleBobPosition = angle => angle === 270 || angle === 90;

export default class GunBehavior {
  constructor(holderBody, holderBehavior, container, actor = undefined, camera = undefined) {
    this.holderBody = holderBody;
    this.holderBehavior = holderBehavior;
    this.container = container;
    this.actor = actor;
    this.camera = camera;
    this.bobAngle = 0;
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
    if (this.holderBehavior.isRunning || !isMiddleBobPosition(this.bobAngle)) {
      this.actor.solidBody.mesh.position.x += getGunXShift(this.bobAngle);
      this.actor.solidBody.mesh.position.y += getGunYShift(this.bobAngle);
      this.bobAngle += GUN.BOB_SPEED;
      if (this.bobAngle >= 360) {
        this.bobAngle = 0;
      }
    }
  }

  update() {
    if (this.camera && this.actor) {
      this.updateActorPosition();
    }
  }
}
