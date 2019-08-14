import { Vec3, Body } from 'cannon';
import { ENTITY_NAME } from '../../constants';
import Actor from '../Actors/Actor';
import Gun from '../Gun';
import EntitiesContainer from '../EntitiesContainer';

export default class EnemyBehavior {
  actor: Actor;
  walkSpeed: number;
  playerBody: Body;
  gun: Gun;
  nextShootInterval: number;
  lastShootSince: number;
  onShoot: Function;

  constructor(actor: Actor, walkSpeed: number, playerBody:Body, container:EntitiesContainer, onShoot: Function) {
    this.actor = actor;
    this.walkSpeed = walkSpeed;
    this.playerBody = playerBody;
    this.gun = <Gun>container.createEntity(
      ENTITY_NAME.GUN,
      { holderBody: this.actor.solidBody.body }
    );
    this.nextShootInterval = 3;
    this.lastShootSince = 0;
    this.onShoot = onShoot;
  }

  update(delta: number) {
    const direction = new Vec3();
    this.playerBody.position.vsub(this.actor.solidBody.body!.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.actor.solidBody.body!.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.actor.solidBody.body!.velocity);

    this.lastShootSince += delta;
    if (this.lastShootSince >= this.nextShootInterval) {
      this.lastShootSince = 0;
      this.gun.shoot(direction);
      this.onShoot();
    }
  }
}
