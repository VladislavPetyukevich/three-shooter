import { Vector3, Camera } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { PlayerActor } from './Actors/PlayerActor';
import { СontrolledBehavior } from './Behaviors/СontrolledBehavior';
import { PLAYER } from '@/constants';

export interface PlayerProps {
  position: Vector3;
  camera: Camera;
}

export class Player extends Entity {
  constructor(props: PlayerProps) {
    const actor = new PlayerActor({
      position: new Vector3(props.position.x, props.position.y / 2, props.position.z),
      size: { width: PLAYER.BODY_WIDTH, height: PLAYER.BODY_HEIGHT, depth: PLAYER.BODY_DEPTH }
    });
    props.camera.position.set(props.position.x, props.position.y, props.position.z);
    super(
      actor,
      new СontrolledBehavior({
        actor: actor,
        camera: props.camera,
        eyeY: PLAYER.BODY_HEIGHT,
        walkSpeed: PLAYER.WALK_SPEED,
        cameraSpeed: PLAYER.CAMERA_ROTATION_SPEED
      }),
    );
  }
}
