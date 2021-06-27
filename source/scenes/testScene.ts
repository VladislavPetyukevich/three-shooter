import {
  PlaneGeometry,
  Mesh,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
  Vector2,
  Vector3,
  Fog,
  Light,
  AmbientLight,
  RepeatWrapping,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { PLAYER, WALL, GAME_TEXTURE_NAME, PI_180 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { Wall } from '@/Entities/Wall/Wall';
import { Door } from '@/Entities/Door/Door';
import { Enemy } from '@/Entities/Enemy/Enemy';
import { Trigger } from '@/Entities/Trigger/Trigger';
import { Torch } from '@/Entities/Torch/Torch';
import { DungeonGenerator, DungeonCellType } from '@/dungeon/DungeonGenerator';
import {
  RoomCellType,
  RoomConstructor,
  getRandomRoomConstructor,
} from '@/dungeon/DungeonRoom';
import { hud } from '@/HUD/HUD';

const enum Direction {
  Top, Bottom, Left, Right
}

export interface Room {
  cellPosition: Vector2;
  walls: Entity[];
  doors: {
    top: Door;
    bottom: Door;
    left: Door;
    right: Door;
  };
}

interface Size {
  width: number;
  height: number;
}

export interface TestSceneProps extends BasicSceneProps {
  onPlayerDeath: Function;
  onFinish: Function;
}

export class TestScene extends BasicScene {
  pointLight: PointLight;
  ambientLight: AmbientLight;
  player: Player;
  mapCellSize: number;
  currentRoom: Room;
  roomSize: Vector2;
  doorWidthHalf: number;
  dungeonSize: Size;
  dungeonRoomsCount: number;
  dungeonCellsPositionToLight: number[];
  dungeonCellDoors: Door[][];
  dungeonRoomConstructors: RoomConstructor[];
  currentRoomIndex: number | null;
  dungeonRoomEnimiesCount: number;
  doors: Door[];
  torches: Torch[];
  visitedRooms: Set<number>;
  initialCameraY: number;
  isPlayerFalling: boolean;
  isPlayerFallingAtStart: boolean;
  playerFallInitialValue: number;
  playerFallCurrenValue: number;
  playerFallMaxValue: number;
  onFinish: Function;

  constructor(props: TestSceneProps) {
    super(props);
    this.mapCellSize = 3;
    this.roomSize = new Vector2(20, 20);
    this.doorWidthHalf = 1;
    this.currentRoom = this.createRoom(new Vector2(0, 0));
    console.log('this.currentRoom:', this.currentRoom);
    this.createConnectedRoom(this.currentRoom.cellPosition, Direction.Top);
    this.dungeonSize = { width: 200, height: 200 };
    this.dungeonRoomsCount = 3;
    this.currentRoomIndex = null;
    this.dungeonCellsPositionToLight = [];
    this.dungeonRoomEnimiesCount = 0;
    this.visitedRooms = new Set();
    this.initialCameraY = 70;
    this.isPlayerFalling = false;
    this.isPlayerFallingAtStart = true;
    this.playerFallInitialValue = 0.3;
    this.playerFallCurrenValue = this.playerFallInitialValue;
    this.playerFallMaxValue = 1.25;
    this.onFinish = props.onFinish;
    this.doors = [];
    this.camera.rotation.y = 225 * PI_180;
    this.player = this.entitiesContainer.add(
      new Player({
        camera: this.camera,
        position: new Vector3(0, PLAYER.BODY_HEIGHT, 0),
        container: this.entitiesContainer,
        audioListener: this.audioListener
      })
    ) as Player;
    this.camera.position.y = this.initialCameraY;
    this.player.actor.mesh.position.x = (this.currentRoom.cellPosition.x + 2) * this.mapCellSize;
    this.player.actor.mesh.position.z = (this.currentRoom.cellPosition.y + 2) * this.mapCellSize;
    this.player.cantMove();
    this.player.setOnHitCallback(() => {
      this.ambientLight.color.setHex(0xFF0000);
      setTimeout(() => this.ambientLight.color.setHex(0xFFFFFF), 100);
    });
    this.player.setOnDeathCallback(() => {
      this.ambientLight.color.setHex(0xFF0000);
      setTimeout(() => this.onFinish(), 400);
    });
    this.torches = this.getSceneTorches();
    this.dungeonCellDoors = [];
    this.dungeonRoomConstructors = [];

    // lights
    this.ambientLight = new AmbientLight(0xFFFFFF, 1);
    this.scene.add(this.ambientLight);
    const pointLightColor = 0xFFFFFF;
    const pointLightIntensity = 30;
    const pointLightDistance = 100;
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
  }

  createConnectedRoom(cellPosition: Vector2, direction: Direction) {
    const connectedRoomX = (direction === Direction.Left) ?
      cellPosition.x - this.roomSize.x :
      (direction === Direction.Right) ?
        cellPosition.x + this.roomSize.x :
        cellPosition.x;
    const connectedRoomY = (direction === Direction.Top) ?
      cellPosition.y - this.roomSize.y :
      (direction === Direction.Bottom) ?
        cellPosition.y + this.roomSize.y :
        cellPosition.y;
    const connectedRoomCellPosition = new Vector2(
      connectedRoomX,
      connectedRoomY
    );
    return this.createRoom(connectedRoomCellPosition);
  }

  createRoom(cellPosition: Vector2): Room {
    const worldCoordinates = this.cellToWorldCoordinates(cellPosition);
    const worldSize = this.cellToWorldCoordinates(this.roomSize);
    return {
      cellPosition: cellPosition,
      walls: [
        ...this.spawnRoomWalls(worldCoordinates, worldSize)
      ],
      doors: {
        top: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Top),
        bottom: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Bottom),
        left: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Left),
        right: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Right),
      }
    };
  }

  spawnRoomWalls(worldCoordinates: Vector2, worldSize: Vector2): Entity[] {
    const doorPadding = this.doorWidthHalf * this.mapCellSize;
    const halfWidth = worldSize.x / 2;
    const halfHeight = worldSize.y / 2;

    const wallsPositionSize = [
      // Top
      {
        position: worldCoordinates,
        size: new Vector2(halfWidth - doorPadding, this.mapCellSize)
      },
      {
        position: new Vector2(worldCoordinates.x + halfWidth + doorPadding, worldCoordinates.y),
        size: new Vector2(halfWidth - doorPadding, this.mapCellSize)
      },
      // Bottom
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + worldSize.y - this.mapCellSize),
        size: new Vector2(halfWidth - doorPadding, this.mapCellSize)
      },
      {
        position: new Vector2(worldCoordinates.x + halfWidth + doorPadding, worldCoordinates.y + worldSize.y - this.mapCellSize),
        size: new Vector2(halfWidth - doorPadding, this.mapCellSize)
      },
      // Left
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + this.mapCellSize),
        size: new Vector2(this.mapCellSize, halfHeight - this.mapCellSize - doorPadding)
      },
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + halfHeight + doorPadding),
        size: new Vector2(this.mapCellSize, halfHeight - this.mapCellSize - doorPadding)
      },
      // Right
      {
        position: new Vector2(worldCoordinates.x + worldSize.x - this.mapCellSize, worldCoordinates.y + this.mapCellSize),
        size: new Vector2(this.mapCellSize, halfHeight - this.mapCellSize - doorPadding)
      },
      {
        position: new Vector2(worldCoordinates.x + worldSize.x - this.mapCellSize, worldCoordinates.y + halfHeight + doorPadding),
        size: new Vector2(this.mapCellSize, halfHeight - this.mapCellSize - doorPadding)
      },
    ];

    return wallsPositionSize.map(
      info => this.spawnWall(
        this.getCenterPosition(info.position, info.size),
        info.size
      )
    );
  }

  spawnRoomDoor(worldCoordinates: Vector2, worldSize: Vector2, direction: Direction) {
    const doorPadding = this.doorWidthHalf * this.mapCellSize;
    const halfWidth = worldSize.x / 2;
    const halfHeight = worldSize.y / 2;
    const isVertical = (
      (direction === Direction.Top) || (direction === Direction.Bottom)
    );
    const doorX = (direction === Direction.Left) ?
      worldCoordinates.x :
      (direction === Direction.Right) ?
        worldCoordinates.x + worldSize.x - this.mapCellSize :
        worldCoordinates.x + halfWidth - this.mapCellSize;
    const doorY = (direction === Direction.Top) ?
      worldCoordinates.y :
      (direction === Direction.Bottom) ?
        worldCoordinates.y + worldSize.y - this.mapCellSize :
        worldCoordinates.y + halfHeight - doorPadding;
    const doorWidth = isVertical ?
      doorPadding * 2 :
      this.mapCellSize;
    const doorHeight = isVertical ?
      this.mapCellSize :
      doorPadding * 2;
    const position = new Vector2(doorX, doorY);
    const size = new Vector2(doorWidth, doorHeight);

    return this.spawnDoor(
      this.getCenterPosition(position, size),
      size
    );
  }

  cellToWorldCoordinates(cellCoordinates: Vector2) {
    return new Vector2(
      cellCoordinates.x * this.mapCellSize,
      cellCoordinates.y * this.mapCellSize,
    );
  }

  getCenterPosition(position: Vector2, size: Vector2) {
    return new Vector2(
      position.x + size.x / 2,
      position.y + size.y / 2
    );
  }

  getSceneTorches() {
    const torches: Torch[] = [];
    for (let i = 4; i--;) {
      torches.push(
        this.entitiesContainer.add(new Torch({
          position: new Vector3(0, -1000, 0),
          player: this.player
        }))
      );
    }
    return torches;
  }

  spawnWall(coordinates: Vector2, size: Vector2) {
    const isHorizontalWall = size.x > size.y;
    const wall = new Wall({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      size: { width: size.x, height: WALL.SIZE, depth: size.y },
      isHorizontalWall: isHorizontalWall
    });
    return this.entitiesContainer.add(wall);
  }

  spawnDoor(coordinates: Vector2, size: Vector2) {
    const isHorizontalWall = size.width > size.height;
    const door = new Door({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      container: this.entitiesContainer,
      size: { width: size.width, height: WALL.SIZE, depth: size.height },
      player: this.player,
      isHorizontalWall: isHorizontalWall
    });
    door.close();
    this.entitiesContainer.add(door);
    return door;
  }

  onEnemyDeath = () => {
    this.dungeonRoomEnimiesCount--;
    if (this.dungeonRoomEnimiesCount !== 0) {
      return;
    }
    if (typeof this.currentRoomIndex !== 'number') {
      return;
    }
    if (this.visitedRooms.size === this.dungeonRoomsCount) {
      // const cellPos = this.dungeonCellsPosition[this.currentRoomIndex];
      // this.spawnRoomHole(cellPos[0], cellPos[1]);
      console.log('TODO: spawn hole trigger in room');
      return;
    }
  }

  spawnEnemy(coordinates: Vector2) {
    const enemy = new Enemy({
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener
    });
    enemy.onDeath(this.onEnemyDeath);
    return this.entitiesContainer.add(enemy);
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
        this.onFinish();
      }
      return;
    }
  }
}
