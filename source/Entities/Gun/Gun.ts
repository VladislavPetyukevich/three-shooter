import { AudioListener, Camera } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { GunActor } from './GunActor';
import { GunBehavior } from './GunBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface Props {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  bulletsPerShoot: number;
}

export class Gun extends Entity {
  constructor(props: Props) {
    const actor = new GunActor();
    const behavior = new GunBehavior({
      container: props.container,
      playerCamera: props.playerCamera,
      audioListener: props.audioListener,
      shootOffsetAngle: props.shootOffsetAngle,
      bulletsPerShoot: props.bulletsPerShoot,
    });

    super(
      ENTITY_TYPE.GUN,
      actor,
      behavior
    );
  }

  update(delta: number) {
    this.behavior.update(delta);
  }
}
