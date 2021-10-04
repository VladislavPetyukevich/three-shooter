import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { PlayerActor } from '@/Entities/Player/PlayerActor';
import { ENTITY_TYPE, BOOMERANG } from '@/constants';
import { Bullet, BulletProps } from '../Bullet/Bullet';
import { BoomerangBehavior } from './BoomerangBehavior';

export interface BoomerangProps extends BulletProps {
  playerActor: PlayerActor;
}

export class Boomerang extends Bullet {
  constructor(props: BoomerangProps) {
    super(props);
    this.velocity = new Vector3();
    this.behavior = new BoomerangBehavior({
      actor: this.actor,
      playerActor: props.playerActor,
      velocity: this.velocity,
      setDirection: this.setDirection,
    });
    this.setDamage(1);
    this.setSpeed(BOOMERANG.SPEED);
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.PLAYER) {
      if ((<BoomerangBehavior>this.behavior).currentPhase === 'flyBlackward') {
        this.container.remove(this.actor.mesh);
        return false;
      }
      return true;
    }
    return super.onCollide(entity);
  }
}

