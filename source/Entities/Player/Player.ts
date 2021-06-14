import { Vector3, Camera, AudioListener } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { PlayerActor } from './PlayerActor';
import { СontrolledBehavior } from './СontrolledBehavior';
import { PLAYER, ENTITY_TYPE } from '@/constants';

export interface PlayerProps {
  position: Vector3;
  camera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class Player extends Entity {
  onHitCallback?: Function;

  constructor(props: PlayerProps) {
    const actor = new PlayerActor({
      position: new Vector3(props.position.x, props.position.y, props.position.z),
      size: { width: PLAYER.BODY_WIDTH, height: PLAYER.BODY_HEIGHT, depth: PLAYER.BODY_DEPTH }
    });
    props.camera.position.set(props.position.x, props.position.y, props.position.z);
    const velocity = new Vector3();
    super(
      ENTITY_TYPE.PLAYER,
      actor,
      new СontrolledBehavior({
        actor: actor,
        camera: props.camera,
        eyeY: PLAYER.BODY_HEIGHT,
        walkSpeed: PLAYER.WALK_SPEED,
        cameraSpeed: PLAYER.CAMERA_ROTATION_SPEED,
        container: props.container,
        velocity: velocity,
        audioListener: props.audioListener
      }),
    );
    this.velocity = velocity;
    this.hp = PLAYER.HP;
  }

  onCollide(entity: Entity) {
    return entity.type !== ENTITY_TYPE.WALL;
  }

  onHit(damage: number) {
    super.onHit(damage);
    if (this.onHitCallback) {
      this.onHitCallback();
    }
  }

  setOnHitCallback(callback: Function) {
    this.onHitCallback = callback;
  }

  cantMove() {
    (<СontrolledBehavior>this.behavior).isCanMove = false;
  }
}
