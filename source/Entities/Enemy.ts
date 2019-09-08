import { AudioListener } from 'three';
import { Body, IBodyEvent } from 'cannon';
import Entity from './Entity';
import EntitiesContainer from './EntitiesContainer';
import SoundsBuffer from './Sounds/SoundsBuffer';
import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';
import EnemySounds from './Sounds/EnemySounds';
import { ENTITY_TYPE, ENEMY } from '@/constants';
import { BulletBody } from '@/SolidBody/PhysicsBullet';

export interface EnemyProps {
  audioListener: AudioListener;
  playerBody: Body;
  position: { x: number, y: number, z: number };
  soundsBuffer: SoundsBuffer;
  container: EntitiesContainer;
}

export default class Enemy extends Entity {
  sounds: EnemySounds;
  audioListener: AudioListener;

  constructor(props: EnemyProps) {
    super(
      ENTITY_TYPE.CREATURE,
      new EnemyActor(props.playerBody, props.position),
      new EnemyBehavior(),
      ENEMY.HP
    );

    (<EnemyBehavior>this.behavior)
      .setWalkSpeed(ENEMY.WALK_SPEED)
      .setPlayerBody(props.playerBody)
      .createGun(this.actor, props.container)
      .setOnShootCallback(this.handleShoot);

    this.audioListener = props.audioListener;
    this.sounds = new EnemySounds(this.audioListener, this.actor, props.soundsBuffer);
    this.actor.solidBody.body!.addEventListener('collide', this.collideHandler);
  }

  handleShoot = () => {
    this.sounds.shoot();
  }

  collideHandler = (event: IBodyEvent) => {
    if ((<BulletBody>event.body).isBullet) {
      this.hp!--;
    }
  }

  update(delta: number) {
    this.actor.update();
    this.behavior.update(delta);
  }
}
