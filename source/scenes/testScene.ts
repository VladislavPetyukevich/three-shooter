import {
  PlaneGeometry,
  Mesh,
  PointLight,
  Matrix4,
  MeshLambertMaterial,
  Vector2,
  Vector3,
  Fog,
  AmbientLight,
  RepeatWrapping,
  Color,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { PLAYER, WALL, GAME_TEXTURE_NAME, PI_180, PI_2 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { WallProps } from '@/Entities/Wall/Wall';
import { WallApathy } from '@/Entities/Wall/Inheritor/WallApathy';
import { WallCowardice } from '@/Entities/Wall/Inheritor/WallCowardice';
import { WallSexualPerversions } from '@/Entities/Wall/Inheritor/WallSexualPerversions';
import { WallNeutral } from '@/Entities/Wall/Inheritor/WallNeutral';
import { Door } from '@/Entities/Door/Door';
import { EnemyBehaviorModifier } from '@/Entities/Enemy/Enemy';
import { EnemyApathy } from '@/Entities/Enemy/Inheritor/EnemyApathy';
import { EnemyCowardice } from '@/Entities/Enemy/Inheritor/EnemyCowardice';
import { EnemySP } from '@/Entities/Enemy/Inheritor/EnemySP';
import { EnemyWithSpawner } from '@/Entities/Enemy/Inheritor/EnemyWithSpawner';
import { Trigger } from '@/Entities/Trigger/Trigger';
import { Torch } from '@/Entities/Torch/Torch';
import { EnemySpawner } from '@/Entities/EnemySpawner/EnemySpawner';
import { GunPickUp } from '@/Entities/GunPickUp/GunPickUp';
import { Shotgun } from '@/Entities/Gun/Inheritor/Shotgun';
import { Machinegun } from '@/Entities/Gun/Inheritor/Machinegun';
import {
  RoomCellType,
  RoomCell,
  RoomConstructors,
  getRandomRoomConstructor,
} from '@/dungeon/DungeonRoom';
import { mindState } from '@/MindState';
import { randomNumbers } from '@/RandomNumbers';

const enum Direction {
  Top, Bottom, Left, Right
}

export const enum RoomType {
  Neutral,
  Apathy,
  Cowardice,
  SexualPerversions,
}

export interface Room {
  type: RoomType;
  cellPosition: Vector2;
  floor: Mesh;
  walls: Entity[];
  doors: {
    top: Door;
    bottom: Door;
    left: Door;
    right: Door;
  };
  neighboringRooms: {
    top: Room | null;
    bottom: Room | null;
    left: Room | null;
    right: Room | null;
  };
  entities: Entity[];
  constructors: RoomConstructors | null;
}

type RoomTorchesPool = [Torch, Torch, Torch, Torch];

interface RoomTorches {
  apathy: RoomTorchesPool,
  cowardice: RoomTorchesPool,
  sexualPerversions: RoomTorchesPool,
  apathyGray: RoomTorchesPool,
  cowardiceGray: RoomTorchesPool,
  sexualPerversionsGray: RoomTorchesPool,
}

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
  mapCellSize: number;
  currentRoom: Room;
  roomSize: Vector2;
  doorWidthHalf: number;
  currentRoomEnimiesCount: number;
  torches: RoomTorches;
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
    this.mapCellSize = 3;
    this.roomSize = new Vector2(20, 20);
    this.doorWidthHalf = 1;
    this.torches = this.getSceneTorches();
    this.currentRoomEnimiesCount = 0;
    this.currentRoom = this.createRoom(new Vector2(0, 0), RoomType.Neutral);
    this.createNeighboringRooms(this.currentRoom);
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
    const roomCenterCell = this.getCenterPosition(this.currentRoom.cellPosition, this.roomSize);
    const positionShift = 8;
    return new Vector2(
      roomCenterCell.x * this.mapCellSize,
      (roomCenterCell.y + positionShift) * this.mapCellSize
    );
  }

  spawnGuns() {
    this.entitiesContainer.add(
      new GunPickUp({
        position: new Vector3(
          this.player.actor.mesh.position.x,
          this.player.actor.mesh.position.y - 1,
          this.player.actor.mesh.position.z - this.mapCellSize * 3,
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
          this.player.actor.mesh.position.z - this.mapCellSize * 5,
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

  createNeighboringRooms(room: Room) {
    const apathyRoom = this.createConnectedRoom(
      room.cellPosition,
      Direction.Top,
      RoomType.Apathy,
    );
    const cowardiceRoom = this.createConnectedRoom(
      room.cellPosition,
      Direction.Left,
      RoomType.Cowardice,
    );
    const sexualPerversionsRoom = this.createConnectedRoom(
      room.cellPosition,
      Direction.Right,
      RoomType.SexualPerversions,
    );
    room.neighboringRooms.top = apathyRoom;
    apathyRoom.neighboringRooms.bottom = room;
    room.neighboringRooms.left = cowardiceRoom;
    cowardiceRoom.neighboringRooms.right = room;
    room.neighboringRooms.right = sexualPerversionsRoom;
    sexualPerversionsRoom.neighboringRooms.left = room;
  }

  createConnectedRoom(cellPosition: Vector2, direction: Direction, type: RoomType) {
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
    return this.createRoom(connectedRoomCellPosition, type);
  }

  createRoom(cellPosition: Vector2, type: RoomType): Room {
    const worldCoordinates = this.cellToWorldCoordinates(cellPosition);
    const worldSize = this.cellToWorldCoordinates(this.roomSize);
    const room: Room = {
      type: type,
      cellPosition: cellPosition,
      floor: this.spawnRoomFloor(worldCoordinates, worldSize),
      walls: [
        ...this.spawnRoomWalls(worldCoordinates, worldSize, type)
      ],
      doors: {
        top: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Top),
        bottom: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Bottom),
        left: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Left),
        right: this.spawnRoomDoor(worldCoordinates, worldSize, Direction.Right),
      },
      neighboringRooms: {
        top: null,
        left: null,
        right: null,
        bottom: null,
      },
      entities: [],
      constructors: (type === RoomType.Neutral) ? null : getRandomRoomConstructor(),
    };
    this.fillRoomBeforeVisit(room);
    if (room.type !== RoomType.Neutral) {
      room.entities.push(
        this.spawnRoomActivateTrigger(room)
      );
      this.moveTorchesToRoom(room);
    }
    return room;
  }

  spawnRoomFloor(worldCoordinates: Vector2, worldSize: Vector2) {
    const floorGeometry = new PlaneGeometry(worldSize.x, worldSize.y);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(-PI_2));
    const floorTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.floorTextureFile);
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.x = worldSize.x;
    floorTexture.repeat.y = worldSize.y;
    floorTexture.needsUpdate = true;
    const floorMaterial = new MeshLambertMaterial({ map: texturesStore.getTexture(GAME_TEXTURE_NAME.floorTextureFile) });
    const floorMesh = new Mesh(floorGeometry, floorMaterial);
    const floorPosition = this.getCenterPosition(
      worldCoordinates, worldSize
    );
    floorMesh.position.set(
      floorPosition.x,
      0,
      floorPosition.y
    );
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);
    return floorMesh;
  }

  spawnRoomWalls(worldCoordinates: Vector2, worldSize: Vector2, roomType: RoomType): Entity[] {
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
        info.size,
        roomType,
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

  spawnRoomActivateTrigger(room: Room) {
    const color = this.getTriggerColor(room);
    const size = new Vector2(this.mapCellSize, this.mapCellSize);
    const position = this.getCenterPosition(
      this.cellToWorldCoordinates(
        new Vector2(
          room.cellPosition.x + this.roomSize.x / 2,
          room.cellPosition.y + this.roomSize.y / 2
        )
      ),
      size
    );
    const trigger = this.entitiesContainer.add(
      new Trigger({
        position: new Vector3(
          position.x,
          this.mapCellSize / 2,
          position.y,
        ),
        size: new Vector3(
          size.x,
          this.mapCellSize,
          size.y,
        ),
        color: new Color(color),
        entitiesContainer: this.entitiesContainer,
        onTrigger: () => this.handleRoomVisit(room),
      })
    ) as Trigger;
    trigger.setIsNotMovingOptimizations(true);
    return trigger;
  }

  handleRoomVisit(room: Room) {
    this.currentRoom = room;
    this.fillRoomAfterVisit(room);
    this.openCloseDoors(room, true);
  }

  getSceneTorches() {
    return {
      apathy: this.createTorchesPool(new Color(0x600004)),
      cowardice: this.createTorchesPool(new Color(0x600004)),
      sexualPerversions: this.createTorchesPool(new Color(0x600004)),
      apathyGray: this.createTorchesPool(new Color(0x333333)),
      cowardiceGray: this.createTorchesPool(new Color(0x333333)),
      sexualPerversionsGray: this.createTorchesPool(new Color(0x333333))
    };
  }

  createTorchesPool(color: Color): RoomTorchesPool {
    return [
      this.createTorch(color),
      this.createTorch(color),
      this.createTorch(color),
      this.createTorch(color),
    ];
  }

  createTorch(color: Color) {
    return this.entitiesContainer.add(new Torch({
      position: new Vector3(0, -1000, 0),
      color: color,
      player: this.player,
    }));
  }

  moveTorchesToRoom(room: Room) {
    if (room.type === RoomType.Neutral) {
      return;
    }
    const torches = this.getRoomTorches(room.type);
    const posO = this.cellToWorldCoordinates(
      new Vector2(
        room.cellPosition.x + this.roomSize.x / 2 - 0.5,
        room.cellPosition.y + this.roomSize.y / 2 + 0.5
      )
    );
    torches[0].actor.mesh.position.set(
      posO.x,
      0,
      posO.y
    );
    const pos1 = this.cellToWorldCoordinates(
      new Vector2(
        room.cellPosition.x + this.roomSize.x / 2 + 0.5,
        room.cellPosition.y + this.roomSize.y / 2 - 0.5
      )
    );
    torches[1].actor.mesh.position.set(
      pos1.x,
      0,
      pos1.y
    );
    const pos2 = this.cellToWorldCoordinates(
      new Vector2(
        room.cellPosition.x + this.roomSize.x / 2 + 1.5,
        room.cellPosition.y + this.roomSize.y / 2 + 0.5
      )
    );
    torches[2].actor.mesh.position.set(
      pos2.x,
      0,
      pos2.y
    );
    const pos3 = this.cellToWorldCoordinates(
      new Vector2(
        room.cellPosition.x + this.roomSize.x / 2 + 0.5,
        room.cellPosition.y + this.roomSize.y / 2 + 1.5
      )
    );
    torches[3].actor.mesh.position.set(
      pos3.x,
      0,
      pos3.y
    );
  }

  getRoomTorches(roomType: RoomType) {
    const roomMindStateLevel = this.getMindeStateLevel(roomType);
    switch (roomType) {
      case RoomType.Apathy:
        if (roomMindStateLevel >= 1) {
          return this.torches.apathyGray;
        }
        return this.torches.apathy;
      case RoomType.Cowardice:
        if (roomMindStateLevel >= 1) {
          return this.torches.cowardiceGray;
        }
        return this.torches.cowardice;
      case RoomType.SexualPerversions:
        if (roomMindStateLevel >= 1) {
          return this.torches.sexualPerversionsGray;
        }
        return this.torches.sexualPerversions;
      default:
        throw new Error(`Cannot get room torches for room type ${roomType}`);
    }
  }

  deleteNeighboringRooms(room: Room) {
    this.deleteRoomRelations(room);
  }

  deleteRoom(room: Room | null) {
    if (!room) {
      return;
    }
    this.scene.remove(room.floor);
    room.walls.forEach(wall =>
      this.entitiesContainer.remove(wall.actor.mesh)
    );
    room.entities.forEach(entity =>
      this.entitiesContainer.remove(entity.actor.mesh)
    );
    const doors = room.doors;
    this.removeEntity(doors.top);
    this.removeEntity(doors.bottom);
    this.removeEntity(doors.left);
    this.removeEntity(doors.right);
    this.deleteRoomRelations(room);
  }

  deleteRoomRelations(room: Room) {
    const neighboringRooms = room.neighboringRooms;
    if (neighboringRooms.top) {
      neighboringRooms.top.neighboringRooms.bottom = null;
      this.deleteRoom(neighboringRooms.top);
      neighboringRooms.top = null;
    }
    if (neighboringRooms.bottom) {
      neighboringRooms.bottom.neighboringRooms.top = null;
      this.deleteRoom(neighboringRooms.bottom);
      neighboringRooms.bottom = null;
    }
    if (neighboringRooms.left) {
      neighboringRooms.left.neighboringRooms.right = null;
      this.deleteRoom(neighboringRooms.left);
      neighboringRooms.left = null;
    }
    if (neighboringRooms.right) {
      neighboringRooms.right.neighboringRooms.left = null;
      this.deleteRoom(neighboringRooms.right);
      neighboringRooms.right = null;
    }
  }

  removeEntity(entity: Entity | null) {
    if (!entity) {
      return;
    }
    this.entitiesContainer.remove(entity.actor.mesh);
  }

  fillRoomAfterVisit(room: Room) {
    if (!room.constructors) {
      return;
    }
    const cells = room.constructors.constructAfterVisit(this.roomSize);
    this.fillRoomCells(room, cells);
  }

  fillRoomBeforeVisit(room: Room) {
    if (!room.constructors) {
      return;
    }
    const cells = room.constructors.constructBeforeVisit(this.roomSize);
    this.fillRoomCells(room, cells);
  }

  fillRoomCells(room: Room, cells: RoomCell[]) {
    cells.forEach(cell => {
      const roomCoordinates = this.cellToWorldCoordinates(room.cellPosition);
      const cellCoordinates =
        this.cellToWorldCoordinates(cell.position).add(roomCoordinates);
      switch (cell.type) {
        case RoomCellType.Wall:
          room.entities.push(
            this.spawnWall(
              this.getCenterPosition(cellCoordinates, new Vector2(this.mapCellSize, this.mapCellSize)),
              new Vector2(this.mapCellSize, this.mapCellSize),
              room.type,
            )
          );
          break;
        case RoomCellType.Enemy:
          this.currentRoomEnimiesCount++;
          this.spawnEnemy(
            cellCoordinates,
            room.type,
          );
          break;
        default:
          break;
      }
    });
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

  spawnWall(coordinates: Vector2, size: Vector2, roomType: RoomType) {
    const isHorizontalWall = size.x > size.y;
    const props: WallProps = {
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      size: { width: size.x, height: WALL.SIZE, depth: size.y },
      isHorizontalWall: isHorizontalWall,
    };
    switch (roomType) {
      case RoomType.Apathy:
        const wallApathy = this.entitiesContainer.add(
          new WallApathy(props)
        );
        wallApathy.setIsNotMovingOptimizations(true);
        return wallApathy;
      case RoomType.Cowardice:
        const wallCowardice = this.entitiesContainer.add(
          new WallCowardice(props)
        );
        wallCowardice.setIsNotMovingOptimizations(true);
        return wallCowardice;
      case RoomType.SexualPerversions:
        const wallSexualPerversions = this.entitiesContainer.add(
          new WallSexualPerversions(props)
        );
        wallSexualPerversions.setIsNotMovingOptimizations(true);
        return wallSexualPerversions;
      default:
        const wallNeutral = this.entitiesContainer.add(
          new WallNeutral(props)
        );
        wallNeutral.setIsNotMovingOptimizations(true);
        return wallNeutral;
    }
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
    this.entitiesContainer.add(door);
    return door;
  }

  onEnemyWithSpawnerDeath = (roomType: RoomType) => (enemy: Entity) => {
    const enemiesFromSpawnerCount = 2;
    this.entitiesContainer.add(
      new EnemySpawner({
        container: this.entitiesContainer,
        positionPadding: this.mapCellSize,
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
    this.deleteNeighboringRooms(room);
    this.createNeighboringRooms(room);
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

  getTriggerColor(room: Room) {
    return this.getMindeStateLevel(room.type) > 0 ? 0x333333 : 0xFF0000;
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
    const enemy = this.getEnemy(
      new Vector2(position.x, position.z),
      roomType
    );
    const collisions =
      this.entitiesContainer.collideChecker.detectCollisions(enemy, enemy.actor.mesh.position);
    if (collisions.entities.length !== 0) {
      return false;
    }
    enemy.onDeath(this.onEnemyDeath);
    this.entitiesContainer.add(enemy);
    this.currentRoomEnimiesCount++;
    return true;
  }

  spawnEnemy(coordinates: Vector2, roomType: RoomType) {
    const isReachedLevel1 =
      (this.getMindeStateLevel(roomType) >= 1);
    const isSpawnSpecialEnemy = randomNumbers.getRandom() >= 0.5;
    if (isReachedLevel1 && isSpawnSpecialEnemy) {
      return this.spawnSpecialEnemy(coordinates, roomType);
    }
    const enemy = this.getEnemy(coordinates, roomType);
    enemy.onDeath(this.onEnemyDeath);
    return this.entitiesContainer.add(enemy);
  }

  getEnemyProps(coordinates: Vector2) {
    return {
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener
    };
  }

  getEnemy(
    coordinates: Vector2,
    roomType: RoomType,
    behaviorModifier?: EnemyBehaviorModifier,
  ) {
    const props = {
      ...this.getEnemyProps(coordinates),
      behaviorModifier,
    };
    switch (roomType) {
      case RoomType.Apathy:
        return new EnemyApathy(props);
      case RoomType.Cowardice:
        return new EnemyCowardice(props);
      case RoomType.SexualPerversions:
        return new EnemySP(props);
      default:
        throw new Error(`Cannot get enemy for room type:${roomType}`);
    }
  }

  getEnemyWithSpawner(coordinates: Vector2) {
    const props = this.getEnemyProps(coordinates);
    return new EnemyWithSpawner(props);
  }

  getEnemyKamikaze(coordinates: Vector2, roomType: RoomType) {
    return this.getEnemy(
      coordinates,
      roomType,
      EnemyBehaviorModifier.kamikaze,
    );
  }

  spawnSpecialEnemy(coordinates: Vector2, roomType: RoomType) {
    if (randomNumbers.getRandom() >= 0.5) {
      const enemy = this.getEnemyWithSpawner(coordinates);
      enemy.onDeath(this.onEnemyWithSpawnerDeath(roomType));
      return this.entitiesContainer.add(enemy);
    } else {
      const enemy = this.getEnemyKamikaze(coordinates, roomType);
      enemy.onDeath(this.onEnemyDeath);
      return this.entitiesContainer.add(enemy);
    }
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
