import {
  PointLight,
  Vector2,
  Vector3,
  Fog,
  AmbientLight,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { PLAYER, PI_180 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { Door } from '@/Entities/Door/Door';
import { Enemy, EnemyBehaviorModifier, OnDeathCallback } from '@/Entities/Enemy/Enemy';
import { EnemyFactory, RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { EnemySpawner } from '@/Entities/EnemySpawner/EnemySpawner';
import { GunPickUp } from '@/Entities/GunPickUp/GunPickUp';
import { Shotgun } from '@/Entities/Gun/Inheritor/Shotgun';
import { Machinegun } from '@/Entities/Gun/Inheritor/Machinegun';
import { BoomerangGun } from '@/Entities/Gun/Inheritor/BoomerangGun';
import { Room, RoomSpawner } from './Spawner/RoomSpawner';
import { CellCoordinates } from './CellCoordinates';
import { mindState } from '@/MindState';
import { randomNumbers } from '@/RandomNumbers';
import { hud } from '@/HUD/HUD';

export interface TestSceneProps extends BasicSceneProps {
  onFinish: Function;
}

export class TestScene extends BasicScene {
  pointLight: PointLight;
  ambientLight: AmbientLight;
  ambientLightColor: number;
  ambientLightIntensity: number;
  player: Player;
  enemiesKillCount: number;
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
    this.enemiesKillCount = 0;
    this.updateHudKillCount();
    const roomSizeScale = 2;
    this.roomSpawner = new RoomSpawner({
      scene: this,
      player: this.player,
      entitiesContainer: this.entitiesContainer,
      cellCoordinates: this.cellCoordinates,
      roomSize: new Vector2(10 * roomSizeScale, 10 * roomSizeScale),
      doorWidthHalf: 1,
      onRoomVisit: this.handleRoomVisit,
      onSpawnEnemy: this.spawnEnemy,
    });
    this.currentRoom = this.roomSpawner.createRoom(new Vector2(0, 0), RoomType.Neutral);
    this.roomSpawner.createNeighboringRooms(this.currentRoom);
    this.openCloseNeighboringRooms(this.currentRoom, false);

    const playerPosition = this.getInitialPlayerPositon();
    this.player.mesh.position.x = playerPosition.x;
    this.player.mesh.position.z = playerPosition.y;
    this.camera.rotation.y = 0;

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
    this.scene.add(this.pointLight);

    this.scene.fog = new Fog(0x202020, 0.15, 150);

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
          this.player.mesh.position.x - this.cellCoordinates.size * 1.5,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 3,
        ),
        size: new Vector3(1, 0.5, 1),
        gun: new BoomerangGun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          player: this.player,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
        }),
        gunTextureName: 'boomerangTextureFile',
      })
    );
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.mesh.position.x,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 3,
        ),
        size: new Vector3(1, 0.5, 1),
        gun: new Shotgun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
        }),
        gunTextureName: 'gunTextureFile',
      })
    );
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.mesh.position.x + this.cellCoordinates.size * 1.5,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 3,
        ),
        size: new Vector3(1, 0.5, 1),
        gun: new Machinegun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
        }),
        gunTextureName: 'machinegunTextureFile',
      })
    );
  }

  handleRoomVisit = (room: Room) => {
    this.currentRoom = room;
    this.roomSpawner.fillRoomAfterVisit(room);
    this.openCloseNeighboringRooms(room, true);
  }

  openCloseNeighboringRooms(room: Room, isClose: boolean) {
    const doors = room.doors;
    const neighboringRooms = room.neighboringRooms;
    if (neighboringRooms.top) {
      this.openCloseNeighboringDoors(
        neighboringRooms.top,
        doors.top,
        neighboringRooms.top.doors.bottom,
        isClose
      );
    }
    if (neighboringRooms.bottom) {
      this.openCloseNeighboringDoors(
        neighboringRooms.bottom,
        doors.bottom,
        neighboringRooms.bottom.doors.top,
        isClose
      );
    }
    if (neighboringRooms.left) {
      this.openCloseNeighboringDoors(
        neighboringRooms.left,
        doors.left,
        neighboringRooms.left.doors.right,
        isClose
      );
    }
    if (neighboringRooms.right) {
      this.openCloseNeighboringDoors(
        neighboringRooms.right,
        doors.right,
        neighboringRooms.right.doors.left,
        isClose
      );
    }
  }

  openCloseNeighboringDoors(
    currentRoom: Room,
    neighboringDoor1: Door,
    neighboringDoor2: Door,
    isClose: boolean
  ) {
    if (this.checkIsRoomShoulOpenClose(currentRoom, isClose)) {
      this.openCloseDoor(neighboringDoor1, isClose);
      this.openCloseDoor(neighboringDoor2, isClose);
    }
  }

  checkIsRoomShoulOpenClose(room: Room, isClose: boolean) {
    if (isClose) {
      return true;
    }
    return !this.checkIsRoomAtMoreThanOthersMindLivel(room);
  }

  checkIsRoomAtMoreThanOthersMindLivel(room: Room) {
    if (mindState.checkIsAllLevelsEqual()) {
      return false;
    }
    const minLevel = mindState.getMinLevel();
    switch (room.type) {
      case RoomType.Apathy:
        return mindState.getLevel('apathy') !== minLevel;
      case RoomType.Cowardice:
        return mindState.getLevel('cowardice') !== minLevel;
      case RoomType.SexualPerversions:
        return mindState.getLevel('sexualPerversions') !== minLevel;
      default:
        return false;
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

  onEnemyWithSpawnerDeath = (enemy: Enemy) => {
    this.incrementEnemiesKillCount();
    const enemiesFromSpawnerCount = 2;
    this.entitiesContainer.add(
      new EnemySpawner({
        container: this.entitiesContainer,
        positionPadding: this.cellCoordinates.size,
        position: enemy.mesh.position.clone(),
        spawnsCount: enemiesFromSpawnerCount,
        onTrigger: this.spawnEnemyFromSpawner(enemy.roomType),
        onDestroy: this.onRoomEntityDestroy,
      })
    );
  }

  onEnemyDeath = () => {
    this.incrementEnemiesKillCount();
    this.onRoomEntityDestroy();
  }

  incrementEnemiesKillCount() {
    this.enemiesKillCount++;
    this.updateHudKillCount();
  }

  onRoomEntityDestroy = () => {
    this.currentRoomEnimiesCount--;
    if (this.currentRoomEnimiesCount !== 0) {
      return;
    }
    this.onRoomClear(this.currentRoom);
  };

  updateHudKillCount() {
    hud.score.drawScore(this.enemiesKillCount);
  }

  onRoomClear(room: Room) {
    this.player.setHp(PLAYER.HP);
    this.increaseMindState(room);
    this.roomSpawner.deleteNeighboringRooms(room);
    this.roomSpawner.createNeighboringRooms(room);
    this.openCloseNeighboringRooms(room, false);
  }

  onMindStateLevelIncrease = () => {
    this.finish();
  }

  increaseMindState(room: Room) {
    switch(room.type) {
      case RoomType.Apathy:
        mindState.increaseCount('apathy');
        break;
      case RoomType.Cowardice:
        mindState.increaseCount('cowardice');
        break;
      case RoomType.SexualPerversions:
        mindState.increaseCount('sexualPerversions');
        break;
      default:
        break;
    }
  }

  spawnEnemyFromSpawner = (roomType: RoomType) => (position: Vector3) => {
    const enemy = this.createEnemy(
      new Vector2(position.x, position.z),
      roomType
    );
    const collisions =
      this.entitiesContainer.collideChecker.detectCollisions(enemy, enemy.mesh.position);
    if (collisions.length !== 0) {
      return false;
    }
    enemy.addOnDeathCallback(this.onEnemyDeath);
    this.entitiesContainer.add(enemy);
    this.currentRoomEnimiesCount++;
    return true;
  }

  spawnEnemy = (coordinates: Vector2, roomType: RoomType, onDeathCallback?: OnDeathCallback) => {
    this.currentRoomEnimiesCount++;
    const isSpawnSpecialEnemy = randomNumbers.getRandom() >= 0.5;
    if (isSpawnSpecialEnemy) {
      const enemy =
        this.spawnSpecialEnemy(
          coordinates,
          roomType,
          this.getRandomEnemyBehaviorModifier(),
        );
      if (onDeathCallback) {
        enemy.addOnDeathCallback(onDeathCallback);
      }
      return enemy;
    }
    const enemy = this.spawnBasicEnemy(coordinates, roomType);
    if (onDeathCallback) {
      enemy.addOnDeathCallback(onDeathCallback);
    }
    return enemy;
  }

  getRandomEnemyBehaviorModifier() {
    if (randomNumbers.getRandom() >= 0.5) {
      return EnemyBehaviorModifier.withSpawner;
    } else if (randomNumbers.getRandom() >= 0.5) {
      return EnemyBehaviorModifier.kamikaze;
    } else if (randomNumbers.getRandom() >= 0.5) {
      return EnemyBehaviorModifier.longRangeAttack;
    } else {
      return EnemyBehaviorModifier.parasite;
    }
  }

  spawnBasicEnemy(coordinates: Vector2, roomType: RoomType) {
    const enemy = this.createEnemy(coordinates, roomType);
    enemy.addOnDeathCallback(this.onEnemyDeath);
    return this.entitiesContainer.add(enemy) as Enemy;
  }

  spawnSpecialEnemy(
    coordinates: Vector2,
    roomType: RoomType,
    behaviorModifier: EnemyBehaviorModifier,
  ) {
    const enemy = this.createEnemy(
      coordinates,
      roomType,
      behaviorModifier
    );
    if (behaviorModifier === EnemyBehaviorModifier.withSpawner) {
      enemy.addOnDeathCallback(this.onEnemyWithSpawnerDeath);
    } else {
      enemy.addOnDeathCallback(this.onEnemyDeath);
    }
    return this.entitiesContainer.add(enemy) as Enemy;
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
    this.pointLight.position.copy(this.player.mesh.position);
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
    mindState.resetValue();
    this.onFinish();
  }
}
