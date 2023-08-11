import { Vector3, Camera, AudioListener } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { GunPickUp } from '@/Entities/GunPickUp/GunPickUp';
import { BoomerangGun } from '../Gun/Inheritor/BoomerangGun';
import { PlayerActor } from './PlayerActor';
import { ControlledBehavior } from './ControlledBehavior';
import { PLAYER, ENTITY_TYPE, ENTITY_MESSAGES } from '@/constants';
import { hud } from '@/HUD/HUD';

export interface PlayerProps {
  position: Vector3;
  camera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class Player extends Entity<PlayerActor, ControlledBehavior> {
  camera: Camera;
  container: EntitiesContainer;
  hp: number;
  isDead: boolean;
  onHitCallback?: Function;
  onDeathCallback?: Function;

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
      new ControlledBehavior({
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
    this.camera = props.camera;
    this.container = props.container;
    this.container.scene.remove(this.camera);
    this.container.scene.add(this.behavior.yawObject);
    this.velocity = velocity;
    this.hp = PLAYER.HP;
    this.isDead = false;
    hud.updateHp(this.hp);
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.GUN_PICK_UP) {
      this.container.remove(entity.mesh);
      const pickedGun = (<GunPickUp>entity).getGun();
      pickedGun.setBulletAuthor(this);
      this.behavior.addGun(pickedGun);
    }
    return entity.type !== ENTITY_TYPE.WALL;
  }

  onHit(damage: number) {
    super.onHit(damage);
    if (this.isDead) {
      return;
    }
    if (this.hp <= 0) {
      this.isDead = true;
      this.cantMove();
      this.behavior.onDeath();
      if (this.onDeathCallback) {
        this.onDeathCallback();
      }
      return;
    }
    this.behavior.onHit();
    if (this.onHitCallback) {
      this.onHitCallback();
    }
    hud.updateHp(this.hp);
  }

  onMessage(message: ENTITY_MESSAGES) {
    switch(message) {
      case ENTITY_MESSAGES.boomerangReturned:
        for (let i = this.behavior.guns.length; i--;) {
          const gun = this.behavior.guns[i];
          if (gun instanceof BoomerangGun) {
            gun.canShoot = true;
            break;
          }
        }
        break;
      default:
        break;
    }
  }

  setOnHitCallback(callback: Function) {
    this.onHitCallback = callback;
  }

  setOnDeathCallback(callback: Function) {
    this.onDeathCallback = callback;
  }

  setHp(hp: number) {
    this.hp = hp;
    hud.updateHp(this.hp);
  }

  canMove() {
    this.behavior.isCanMove = true;
  }

  cantMove() {
    this.behavior.isCanMove = false;
  }

  getGuns() {
    return this.behavior.guns;
  }

  onDestroy() {
    this.behavior.onDestroy();
  }
}
