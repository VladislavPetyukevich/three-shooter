import { Vector3, Camera } from 'three';
import { Body } from 'cannon';
import { GUN, ENTITY_NAME } from '../../constants';
import { toRadians } from '../../utils';
import Behavior from './Behavior';
import EntitiesContainer from '../EntitiesContainer';
import Actor from '../Actors/Actor';
import Bullet from '../Bullet';

const BOB_DISTANCE_Y = GUN.BOB_DISTANCE / 2;

const getGunXShift = (angle: number) => Math.cos(toRadians(angle)) * GUN.BOB_DISTANCE;
const getGunYShift = (angle: number) => Math.abs(Math.sin(toRadians(angle)) * BOB_DISTANCE_Y);

const isMiddleBobPosition = (angle: number) => angle === 270 || angle === 90;

export default class GunBehavior implements Behavior {
  actor?: Actor;
  holderBody?: Body;
  holderBehavior?: Behavior;
  container?: EntitiesContainer;
  camera?: Camera;
  bobAngle: number;

  constructor() {
    this.bobAngle = 0;
  }

  setActor(actor: Actor) {
    this.actor = actor;
    return this;
  }

  setHolderBody(holderBody: Body) {
    this.holderBody = holderBody;
    return this;
  }

  setHolderBehavior(holderBehavior: Behavior) {
    this.holderBehavior = holderBehavior;
    return this;
  }

  setContainer(container: EntitiesContainer) {
    this.container = container;
    return this;
  }

  setCamera(camera: Camera) {
    this.camera = camera;
    return this;
  }

  shoot = (direction: { x: number, y: number, z: number }) => {
    if (!this.holderBody || !this.container) {
      return;
    }

    const shootVelocity = 70;
    const bulletShapeRadius = 0.3;
    const bulletPositionOffset = this.holderBody.shapes[0].boundingSphereRadius * 1.02 + bulletShapeRadius;
    const bulletPosition = new Vector3(
      this.holderBody.position.x + direction.x * bulletPositionOffset,
      this.holderBody.position.y + direction.y * bulletPositionOffset,
      this.holderBody.position.z + direction.z * bulletPositionOffset
    );
    bulletPosition.y -= 0.3 * 1.02;
    const bullet = <Bullet>this.container.createEntity(
      ENTITY_NAME.BULLET,
      { position: bulletPosition }
    );
    bullet.actor.solidBody.body!.velocity.set(
      direction.x * shootVelocity,
      direction.y * shootVelocity,
      direction.z * shootVelocity
    );
  }

  updateActorPosition() {
    this.actor!.solidBody.mesh!.position.copy(this.camera!.position);
    this.actor!.solidBody.mesh!.position.y -= 0.3;
    this.actor!.solidBody.mesh!.position.z -= 0.3;
    // if (this.holderBehavior.isRunning || !isMiddleBobPosition(this.bobAngle)) {
    //   this.actor.solidBody.mesh.position.x += getGunXShift(this.bobAngle);
    //   this.actor.solidBody.mesh.position.y += getGunYShift(this.bobAngle);
    //   this.bobAngle += GUN.BOB_SPEED;
    //   if (this.bobAngle >= 360) {
    //     this.bobAngle = 0;
    //   }
    // }
  }

  update() {
    if (this.camera && this.actor) {
      this.updateActorPosition();
    }
  }
}
