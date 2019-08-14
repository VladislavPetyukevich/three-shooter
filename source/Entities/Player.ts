import { Vector3, Camera } from 'three';
import PlayerActor from './Actors/PlayerActor';
import СontrolledBehavior from './Behaviors/СontrolledBehavior';
import EntitiesContainer from './EntitiesContainer';
import { ENTITY_TYPE, PLAYER } from '../constants';
import Entity from './Entity';

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
      new СontrolledBehavior(actor, PLAYER.WALK_SPEED, props.camera, props.container)
    );
    // this.actor.solidBody.body._hp = 100;
  }
}
