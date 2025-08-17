import {
  Vector2,
  Vector3,
  AmbientLight,
  Mesh,
  MeshBasicMaterial,
  BackSide,
  RepeatWrapping,
  SphereGeometry,
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { Entity } from '@/core/Entities/Entity';
import { PLAYER, roomSize } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { Door } from '@/Entities/Door/Door';
import { Enemy, OnDeathCallback } from '@/Entities/Enemy/Enemy';
import { EnemyFactory, RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { GunPickUp } from '@/Entities/GunPickUp/GunPickUp';
import { Shotgun } from '@/Entities/Gun/Inheritor/Shotgun';
import { Machinegun } from '@/Entities/Gun/Inheritor/Machinegun';
import { BoomerangGun } from '@/Entities/Gun/Inheritor/BoomerangGun';
import { Room, RoomSpawner } from './Spawner/RoomSpawner';
import { CellCoordinates } from './CellCoordinates';
import { mindState } from '@/MindState';
import { hud } from '@/HUD/HUD';
import { PlayerLogs } from '@/PlayerLogs';
import { OnScoreSubmit } from '..';
import { BulletShoutgunPlayer } from '@/Entities/Bullet/Inheritor/BulletShoutgunPlayer';
import { texturesStore } from '@/core/loaders';

export type OnEnemySpawn = (
  cellCoordinates: Vector2,
  roomType: RoomType,
  dungeonLevel: number,
  kind: EnemyKind,
  spawnerOnDeathCallback?: OnDeathCallback,
) => Entity;

export interface TestSceneProps extends BasicSceneProps {
  onFinish: () => void;
  onScoreSubmit: OnScoreSubmit;
}

export class TestScene extends BasicScene {
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
  onFinish: () => void;
  logs: PlayerLogs;
  skybox: Mesh;
  skyboxMaterial: MeshBasicMaterial;

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
        audioListener: this.audioListener,
        audioSlices: this.audioSlices,
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
      props.onScoreSubmit(this.logs.values);
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
    this.roomSpawner = new RoomSpawner({
      scene: this,
      player: this.player,
      entitiesContainer: this.entitiesContainer,
      cellCoordinates: this.cellCoordinates,
      roomSize,
      doorWidthHalf: 1,
      onRoomVisit: this.handleRoomVisit,
      onEnemySpawn: this.spawnEnemy,
    });
    this.currentRoom = this.roomSpawner.createRoom(new Vector2(0, 0), {
      constructor: {
        getCells: () => [],
        roomType: RoomType.Neutral,
      },
      dungeonLevel: 0,
    });
    this.roomSpawner.createNeighboringRooms(this.currentRoom);
    this.openCloseNeighboringRooms(this.currentRoom, false);

    const playerPosition = this.getInitialPlayerPositon();
    this.player.mesh.position.x = playerPosition.x;
    this.player.mesh.position.z = playerPosition.y;

    this.spawnGuns();

    // lights
    this.ambientLightColor = 0xE7E7E7;
    this.ambientLightIntensity = 6;
    this.ambientLight = new AmbientLight(
      this.ambientLightColor,
      this.ambientLightIntensity
    );
    this.scene.add(this.ambientLight);

    this.logs = new PlayerLogs();

    const skyboxSize = 300;
    const skyboxGeometry = new SphereGeometry(skyboxSize, 32, 32)
    const texture = texturesStore.getTexture('skybox');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.x = skyboxSize / 32;
    texture.repeat.y = skyboxSize / 32;
    this.skyboxMaterial = new MeshBasicMaterial({
      map: texture,
      side: BackSide,
    });
    this.skybox = new Mesh(skyboxGeometry, this.skyboxMaterial);
    this.skybox.rotation.y = Math.PI / 2;
    this.skybox.position.copy(this.player.mesh.position);
    this.skybox.position.setY(this.skybox.position.y + skyboxSize / 2 - PLAYER.BODY_HEIGHT * 2);
    this.scene.add(this.skybox);
  }

  getInitialPlayerPositon() {
    const roomCenterCell = this.getCenterPosition(this.currentRoom.cellPosition, this.roomSpawner.roomSize);
    const positionShift = -1;
    return new Vector2(
      roomCenterCell.x * this.cellCoordinates.size,
      (roomCenterCell.y + positionShift) * this.cellCoordinates.size
    );
  }

  spawnGuns() {
    const pickUpSize = new Vector3(1, 1, 0.00001);
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.mesh.position.x,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 3,
        ),
        size: pickUpSize,
        gun: new Shotgun({
          BulletClass: BulletShoutgunPlayer,
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
          shootOffsetY: true,
          audioSlices: this.audioSlices,
        }),
        gunTextureName: 'gunTextureFile',
      })
    );
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.mesh.position.x,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 2,
        ),
        size: pickUpSize,
        gun: new Machinegun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
          audioSlices: this.audioSlices,
        }),
        gunTextureName: 'machinegunTextureFile',
      })
    );
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.mesh.position.x,
          this.player.mesh.position.y - 1,
          this.player.mesh.position.z - this.cellCoordinates.size * 1,
        ),
        size: pickUpSize,
        gun: new BoomerangGun({
          container: this.entitiesContainer,
          playerCamera: this.player.camera,
          audioListener: this.audioListener,
          holderMesh: this.player.mesh,
          audioSlices: this.audioSlices,
        }),
        gunTextureName: 'boomerangTextureFile',
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
        doors.top,
        neighboringRooms.top.doors.bottom,
        isClose
      );
    }
    if (neighboringRooms.bottom) {
      this.openCloseNeighboringDoors(
        doors.bottom,
        neighboringRooms.bottom.doors.top,
        isClose
      );
    }
  }

  openCloseNeighboringDoors(
    neighboringDoor1: Door,
    neighboringDoor2: Door,
    isClose: boolean
  ) {
    this.openCloseDoor(neighboringDoor1, isClose);
    this.openCloseDoor(neighboringDoor2, isClose);
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

  onEnemyDeath = (enemy: Enemy) => {
    this.logs.enemyKill(enemy);
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
    this.increaseMindState();
    this.roomSpawner.deleteNeighboringRooms(room);
    this.roomSpawner.createNeighboringRooms(room);
    this.openCloseNeighboringRooms(room, false);
  }

  increaseMindState() {
    mindState.increaseTotalCount();
  }

  spawnEnemyFromSpawner = (roomType: RoomType) => (position: Vector3) => {
    const enemy = this.createEnemy(
      new Vector2(position.x, position.z),
      roomType,
      this.currentRoom.roomConstructor.dungeonLevel,
      EnemyKind.Flyguy,
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

  spawnEnemy: OnEnemySpawn = (
    coordinates,
    roomType,
    dungeonLevel,
    kind,
    onDeathCallback,
  ) => {
    this.currentRoomEnimiesCount++;
    const enemy = this.createEnemy(
      coordinates,
      roomType,
      dungeonLevel,
      kind,
    );
    enemy.addOnDeathCallback(this.onEnemyDeath);
    if (onDeathCallback) {
      enemy.addOnDeathCallback(onDeathCallback);
    }
    return this.entitiesContainer.add(enemy) as Enemy;
  }

  createEnemy(
    coordinates: Vector2,
    roomType: RoomType,
    dungeonLevel: number,
    kind: EnemyKind,
  ) {
    return this.enemyFactory.createEnemy({
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener,
      audioSlices: this.audioSlices,
      roomType,
      dungeonLevel,
      kind,
    });
  }

  update(delta: number) {
    super.update(delta);
    this.updateDeathCamera(delta);
    this.updateFalling(delta);
    this.skybox.position.copy(this.player.mesh.position);
    this.skyboxMaterial.map?.offset.addScalar(delta * 0.013);
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
    this.onFinish();
  }
}
