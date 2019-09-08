import { Vector3, Camera } from 'three';
import Entity from '@/core/Entities/Entity';
import EntitiesContainer from '@/core/Entities/EntitiesContainer';
import PlayerActor from './Actors/PlayerActor';
import СontrolledBehavior from './Behaviors/СontrolledBehavior';
import { ENTITY_TYPE, PLAYER } from '@/constants';

export interface PlayerProps {
  type: ENTITY_TYPE,
  position: Vector3;
  container: EntitiesContainer;
  camera: Camera;
}

export default class Player extends Entity {
  constructor(props: PlayerProps) {
    const actor = new PlayerActor(props.position);
    super(
      ENTITY_TYPE.CREATURE,
      actor,
      new СontrolledBehavior(actor, PLAYER.WALK_SPEED, props.camera, props.container),
      PLAYER.HP
    );
  }
}
