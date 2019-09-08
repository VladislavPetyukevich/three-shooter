import { Vec3, Body } from 'cannon';
import Actor from '@/Entities/Actors/Actor';
import Behavior from './Behavior';
import Gun from '@/Entities/Gun';
import EntitiesContainer from '@/Entities/EntitiesContainer';

export default class EnemyBehavior implements Behavior {
  actor?: Actor;
  walkSpeed?: number;
  playerBody?: Body;
  gun?: Gun;
  nextShootInterval: number;
  lastShootSince: number;
  onShoot?: Function;
  container?: EntitiesContainer;

  constructor() {
    this.nextShootInterval = 3;
    this.lastShootSince = 0;
  }

  setWalkSpeed = (walkSpeed: number) => {
    this.walkSpeed = walkSpeed;
    return this;
  }

  setPlayerBody = (playerBody: Body) => {
    this.playerBody = playerBody;
    return this;
  }

  createGun = (actor: Actor, container: EntitiesContainer) => {
    this.actor = actor;
    this.container = container;
    this.gun = <Gun>this.container.createEntity(
      Gun,
      { holderBody: this.actor.solidBody.body }
    );
    return this;
  }

  setOnShootCallback = (callback: Function) => {
    this.onShoot = callback;
    return this;
  }

  update(delta: number) {
    if (!this.actor || !this.playerBody || !this.walkSpeed) {
      return;
    }
    const direction = new Vec3();
    this.playerBody.position.vsub(this.actor.solidBody.body!.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.actor.solidBody.body!.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.actor.solidBody.body!.velocity);

    if (!this.gun) {
      return;
    }
    this.lastShootSince += delta;
    if (this.lastShootSince >= this.nextShootInterval) {
      this.lastShootSince = 0;
      this.gun.shoot(direction);
      this.onShoot && this.onShoot();
    }
  }
}
