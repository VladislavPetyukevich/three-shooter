import { Body, IBodyEvent } from 'cannon';
import Entity from './Entity';
import FlyingEnemyActor from './Actors/FlyingEnemyActor';
import FlyingEnemyBehavior from './Behaviors/FlyingEnemyBehavior';
import { ENTITY_TYPE, FLYING_ENEMY } from '@/constants';
import { BulletBody } from '@/SolidBody/PhysicsBullet';

export interface FlyingEnemyProps {
  playerBody: Body;
  position: { x: number, y: number, z: number };
}

export default class FlyingEnemy extends Entity {
  constructor(props: FlyingEnemyProps) {
    super(
      ENTITY_TYPE.CREATURE,
      new FlyingEnemyActor(props.playerBody, props.position),
      new FlyingEnemyBehavior(),
      FLYING_ENEMY.HP
    );

    (<FlyingEnemyBehavior>this.behavior)
      .setActor(this.actor)
      .setFlyingSpeed(FLYING_ENEMY.FLYING_SPEED)
      .setPlayerBody(props.playerBody);
    this.actor.solidBody.body!.addEventListener('collide', this.collideHandler);
  }

  collideHandler = (event: IBodyEvent) => {
    if ((<BulletBody>event.body).isBullet) {
      this.hp!--;
    }
  }


  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
