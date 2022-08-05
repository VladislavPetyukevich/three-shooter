import {
  PointLight,
  Vector2,
  Vector3,
  Fog,
  AmbientLight,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { PLAYER, GAME_TEXTURE_NAME, PI_180 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { Door } from '@/Entities/Door/Door';
import { EnemyBehaviorModifier } from '@/Entities/Enemy/Enemy';
import { EnemyFactory, RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { EnemySpawner } from '@/Entities/EnemySpawner/EnemySpawner';
import { GunPickUp } from '@/Entities/GunPickUp/GunPickUp';
import { Shotgun } from '@/Entities/Gun/Inheritor/Shotgun';
import { Machinegun } from '@/Entities/Gun/Inheritor/Machinegun';
import { Room, RoomSpawner } from './Spawner/RoomSpawner';
import { CellCoordinates } from './CellCoordinates';
import { mindState } from '@/MindState';
import { randomNumbers } from '@/RandomNumbers';

export interface TestSceneProps extends BasicSceneProps {
  onPlayerDeath: Function;
  onFinish: Function;
}

export class TestScene extends BasicScene {
  pointLight: PointLight;
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;
  player: Player;
  cellCoordinates: CellCoordinates;
  currentRoom: Room;
  enemyFactory: EnemyFactory;
  roomSpawner: RoomSpawner;
  currentRoomEnimiesCount: number;
  initialCameraY: number;
  isPlayerFalling: boolean;
  isPlayerFallingAtStart: boolean;
  playerFallInitialValue: number;
  playerFallCurrenValue: number;
  playerFallMaxValue: number;
  onFinish: Function;

  constructor(props: TestSceneProps) {
    super(props);

    this.initialCameraY = 70;
    this.isPlayerFalling = false;
    this.isPlayerFallingAtStart = true;
    this.playerFallInitialValue = 0.3;
    this.playerFallCurrenValue = this.playerFallInitialValue;
    this.playerFallMaxValue = 1.25;
    this.onFinish = props.onFinish;
    this.player = this.entitiesContainer.add(
      new Player({
        camera: this.camera,
        position: new Vector3(0, PLAYER.BODY_HEIGHT, 0),
        container: this.entitiesContainer,
        audioListener: this.audioListener
      })
    ) as Player;
    this.camera.position.y = this.initialCameraY;
    this.player.cantMove();
    this.player.setOnHitCallback(() => {
      this.ambientLight.color.setHex(0xFF0000);
      this.ambientLight.intensity = 2.3;
      setTimeout(() => {
        this.ambientLight.color.setHex(this.ambientLightColor);
        this.ambientLight.intensity = this.ambientLightIntensity;
      }, 100);
    });
    this.player.setOnDeathCallback(() => {
      this.ambientLight.color.setHex(0xFF0000);
      setTimeout(() => this.finish(), 400);
    });
    this.cellCoordinates = new CellCoordinates({
      size: 3,
    });
    this.enemyFactory = new EnemyFactory();
    this.currentRoomEnimiesCount = 0;
    this.roomSpawner = new RoomSpawner({
      scene: this.scene,
      player: this.player,
      entitiesContainer: this.entitiesContainer,
      cellCoordinates: this.cellCoordinates,
      roomSize: new Vector2(20, 20),
      doorWidthHalf: 1,
      onRoomVisit: this.handleRoomVisit,
      onSpawnEnemy: this.spawnEnemy,
    });
    this.currentRoom = this.roomSpawner.createRoom(new Vector2(0, 0), RoomType.Neutral);
    this.roomSpawner.createNeighboringRooms(this.currentRoom);
    this.openCloseDoors(this.currentRoom, false);

    const playerPosition = this.getInitialPlayerPositon();
    this.player.actor.mesh.position.x = playerPosition.x;
    this.player.actor.mesh.position.z = playerPosition.y;
    this.camera.rotation.y = this.getInitialCameraRotation();

    this.spawnGuns();

    // lights
    this.ambientLightColor = 0x404040;
    this.ambientLightIntensity = 7;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);
    const pointLightColor = 0xFFFFFF;
    const pointLightIntensity = 110;
    const pointLightDistance = 130;
    this.pointLight = new PointLight(
      pointLightColor,
      pointLightIntensity,
      pointLightDistance
    );
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    this.scene.fog = new Fog(0x000000, 1.15, 200);

    // MindState
    mindState.addLevelIncreaseListener(this.onMindStateLevelIncrease);
  }

  getInitialPlayerPositon() {
    const roomCenterCell = this.getCenterPosition(this.currentRoom.cellPosition, this.roomSpawner.roomSize);
    const positionShift = 8;
    return new Vector2(
      roomCenterCell.x * this.cellCoordinates.size,
      (roomCenterCell.y + positionShift) * this.cellCoordinates.size
    );
  }

  spawnGuns() {
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.actor.mesh.position.x,
          this.player.actor.mesh.position.y - 1,
          this.player.actor.mesh.position.z - this.cellCoordinates.size * 3,
        ),
        size: new Vector3(1, 0.5, 1),
        gun: new Shotgun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderGeometry: this.player.actor.mesh.geometry,
        }),
        gunTextureName: GAME_TEXTURE_NAME.gunTextureFile,
      })
    );
    if (!mindState.checkIsAnyPropReachLevel(1)) {
      return;
    }
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.actor.mesh.position.x,
          this.player.actor.mesh.position.y - 1,
          this.player.actor.mesh.position.z - this.cellCoordinates.size * 5,
        ),
        size: new Vector3(1, 0.5, 1),
        gun: new Machinegun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderGeometry: this.player.actor.mesh.geometry,
        }),
        gunTextureName: GAME_TEXTURE_NAME.machinegunTextureFile,
      })
    );
  }

  getInitialCameraRotation() {
    if (this.checkIsPlayerShouldLookAtRoom(RoomType.Cowardice)) {
      // (90 / 2 + 4) * PI_180;
      return 49 * PI_180;
    }
    if (this.checkIsPlayerShouldLookAtRoom(RoomType.SexualPerversions)) {
      // (270 + 90 / 2 - 4) * PI_180;
      return 311 * PI_180;
    }
    return 0;
  }

  checkIsPlayerShouldLookAtRoom(roomType: RoomType) {
    return this.getMindeStateLevel(roomType) < 1;
  }

  handleRoomVisit = (room: Room) => {
    this.currentRoom = room;
    this.roomSpawner.fillRoomAfterVisit(room);
    this.openCloseDoors(room, true);
  }

  openCloseDoors(room: Room, isClose: boolean) {
    const doors = room.doors;
    const neighboringRooms = room.neighboringRooms;
    if (neighboringRooms.top) {
      this.openCloseDoor(doors.top, isClose);
      this.openCloseDoor(neighboringRooms.top.doors.bottom, isClose);
    }
    if (neighboringRooms.bottom) {
      this.openCloseDoor(doors.bottom, isClose);
      this.openCloseDoor(neighboringRooms.bottom.doors.top, isClose);
    }
    if (neighboringRooms.left) {
      this.openCloseDoor(doors.left, isClose);
      this.openCloseDoor(neighboringRooms.left.doors.right, isClose);
    }
    if (neighboringRooms.right) {
      this.openCloseDoor(doors.right, isClose);
      this.openCloseDoor(neighboringRooms.right.doors.left, isClose);
    }
  }

  openCloseDoor(door: Door | null, isClose: boolean) {
    if (!door) {
      return;
    }
    if (isClose) {
      door.close();
    } else {
       door.open();
    }
  }

  getCenterPosition(position: Vector2, size: Vector2) {
    return new Vector2(
      position.x + size.x / 2,
      position.y + size.y / 2
    );
  }

  onEnemyWithSpawnerDeath = (roomType: RoomType) => (enemy: Entity) => {
    const enemiesFromSpawnerCount = 2;
    this.entitiesContainer.add(
      new EnemySpawner({
        container: this.entitiesContainer,
        positionPadding: this.cellCoordinates.size,
        position: enemy.actor.mesh.position.clone(),
        spawnsCount: enemiesFromSpawnerCount,
        onTrigger: this.spawnEnemyFromSpawner(roomType),
        onDestroy: this.onEnemyDeath,
      })
    );
  }


  onEnemyDeath = () => {
    this.currentRoomEnimiesCount--;
    if (this.currentRoomEnimiesCount !== 0) {
      return;
    }
    this.onRoomClear(this.currentRoom);
  }

  onRoomClear(room: Room) {
    this.player.setHp(PLAYER.HP);
    this.increaseMindState(room);
    this.roomSpawner.deleteNeighboringRooms(room);
    this.roomSpawner.createNeighboringRooms(room);
    this.openCloseDoors(room, false);
  }

  onMindStateLevelIncrease = () => {
    this.finish();
  }

  increaseMindState(room: Room) {
    switch(room.type) {
      case RoomType.Apathy:
        mindState.increaseValue('apathy');
        break;
      case RoomType.Cowardice:
        mindState.increaseValue('cowardice');
        break;
      case RoomType.SexualPerversions:
        mindState.increaseValue('sexualPerversions');
        break;
      default:
        break;
    }
  }

  getMindeStateLevel(roomType: RoomType) {
    switch(roomType) {
      case RoomType.Apathy:
        return mindState.getLevel().apathy;
      case RoomType.Cowardice:
        return mindState.getLevel().cowardice;
      case RoomType.SexualPerversions:
        return mindState.getLevel().sexualPerversions;
      default:
        return 0;
    }
  }

  spawnEnemyFromSpawner = (roomType: RoomType) => (position: Vector3) => {
    const enemy = this.createEnemy(
      new Vector2(position.x, position.z),
      roomType
    );
    const collisions =
      this.entitiesContainer.collideChecker.detectCollisions(enemy, enemy.actor.mesh.position);
    if (collisions.length !== 0) {
      return false;
    }
    enemy.onDeath(this.onEnemyDeath);
    this.entitiesContainer.add(enemy);
    this.currentRoomEnimiesCount++;
    return true;
  }

  spawnEnemy = (coordinates: Vector2, roomType: RoomType) => {
    this.currentRoomEnimiesCount++;
    const isReachedLevel1 =
      this.getMindeStateLevel(roomType) >= 1;
    const isSpawnSpecialEnemy = randomNumbers.getRandom() >= 0.5;
    if (isReachedLevel1 && isSpawnSpecialEnemy) {
      return this.spawnSpecialEnemy(
        coordinates,
        roomType,
        this.getRandomEnemyBehaviorModifier()
      );
    }
    return this.spawnBasicEnemy(coordinates, roomType);
  }

  getRandomEnemyBehaviorModifier() {
    if (randomNumbers.getRandom() >= 0.5) {
      return EnemyBehaviorModifier.withSpawner;
    } else if (randomNumbers.getRandom() >= 0.5) {
      return EnemyBehaviorModifier.kamikaze;
    } else {
      return EnemyBehaviorModifier.parasite;
    }
  }

  spawnBasicEnemy(coordinates: Vector2, roomType: RoomType) {
    const enemy = this.createEnemy(coordinates, roomType);
    enemy.onDeath(this.onEnemyDeath);
    return this.entitiesContainer.add(enemy);
  }

  spawnSpecialEnemy(
    coordinates: Vector2,
    roomType: RoomType,
    behaviorModifier: EnemyBehaviorModifier
  ) {
    const enemy = this.createEnemy(
      coordinates,
      roomType,
      behaviorModifier
    );
    const onDeath =
      (behaviorModifier === EnemyBehaviorModifier.withSpawner) ?
      this.onEnemyWithSpawnerDeath(roomType) :
      this.onEnemyDeath;
    enemy.onDeath(onDeath);
    return this.entitiesContainer.add(enemy);
  }

  createEnemy(
    coordinates: Vector2,
    roomType: RoomType,
    behaviorModifier?: EnemyBehaviorModifier,
  ) {
    return this.enemyFactory.createEnemy({
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener,
      roomType,
      behaviorModifier,
    });
  }

  update(delta: number) {
    super.update(delta);
    this.updateDeathCamera(delta);
    this.updateFalling(delta);
    this.pointLight.position.copy(this.player.actor.mesh.position);
  }

  updateDeathCamera(delta: number) {
    if (!this.player.isDead) {
      return;
    }
    this.camera.position.y = this.lerp(
      this.camera.position.y,
      0,
      delta,
    );
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  updateFalling(delta: number) {
    if (!this.isPlayerFalling && !this.isPlayerFallingAtStart) {
      return;
    }
    this.player.cantMove();
    this.playerFallCurrenValue += delta / 2;
    this.camera.position.y -= Math.pow(this.playerFallCurrenValue, 4);
    if (this.isPlayerFallingAtStart) {
      if (this.camera.position.y <= PLAYER.BODY_HEIGHT) {
        this.camera.position.y = PLAYER.BODY_HEIGHT;
        this.isPlayerFallingAtStart = false;
        this.playerFallCurrenValue = this.playerFallInitialValue;
        this.player.canMove();
      }
      return;
    }
    if (this.isPlayerFalling) {
      if (this.playerFallCurrenValue >= this.playerFallMaxValue) {
        this.isPlayerFalling = false;
        this.finish();
      }
      return;
    }
  }

  finish() {
    mindState.removeLevelIncreaseListener(this.onMindStateLevelIncrease);
    this.onFinish();
  }
}
