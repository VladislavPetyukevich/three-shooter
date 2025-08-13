import {
  PlaneGeometry,
  Mesh,
  Matrix4,
  Vector2,
  Vector3,
  RepeatWrapping,
  Color,
  MeshLambertMaterial,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { WALL, PI_2, ENTITY_TYPE } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { Player } from '@/Entities/Player/Player';
import { WallProps } from '@/Entities/Wall/Wall';
import { WallApathy } from '@/Entities/Wall/Inheritor/WallApathy';
import { WallCowardice } from '@/Entities/Wall/Inheritor/WallCowardice';
import { WallSexualPerversions } from '@/Entities/Wall/Inheritor/WallSexualPerversions';
import { WallNeutral } from '@/Entities/Wall/Inheritor/WallNeutral';
import { Door } from '@/Entities/Door/Door';
import { DoorWall } from '@/Entities/DoorWall/DoorWall';
import { RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { Trigger } from '@/Entities/Trigger/Trigger';
import { Torch } from '@/Entities/Torch/Torch';
import {
  RoomCellType,
  RoomCell,
  EnemyRoomCell,
  RoomCellEventType,
  DungeonRoom,
  WallRoomCell,
} from '@/dungeon/DungeonRoom';
import { CellCoordinates } from '@/scenes/CellCoordinates';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { OnEnemySpawn, TestScene } from '../testScene';
import { EntitiesPool } from './EntitiesPool';
import { FireFlare } from '@/Entities/FireFlare/FireFlare';

const enum Direction {
  Top, Bottom, Left, Right
}

export interface Room {
  type: RoomType;
  cellPosition: Vector2;
  floor: Mesh;
  walls: Entity[];
  doors: {
    top: Door;
    bottom: Door;
  };
  neighboringRooms: {
    top: Room | null;
    bottom: Room | null;
  };
  entities: Entity[];
  constructorIndex: number;
}

export interface RoomSpawnerProps {
  scene: TestScene;
  player: Player;
  entitiesContainer: EntitiesContainer;
  cellCoordinates: CellCoordinates;
  roomSize: Vector2;
  doorWidthHalf: number;
  onRoomVisit: (room: Room) => void;
  onEnemySpawn: OnEnemySpawn;
}

export class RoomSpawner {
  scene: RoomSpawnerProps['scene'];
  player: RoomSpawnerProps['player'];
  entitiesContainer: RoomSpawnerProps['entitiesContainer'];
  cellCoordinates: RoomSpawnerProps['cellCoordinates'];
  roomSize: RoomSpawnerProps['roomSize'];
  doorWidthHalf: RoomSpawnerProps['doorWidthHalf'];
  onRoomVisit: RoomSpawnerProps['onRoomVisit'];
  onEnemySpawn: RoomSpawnerProps['onEnemySpawn'];
  torchesPool: EntitiesPool;
  fireFlaresPool: EntitiesPool;
  dungeonRoom: DungeonRoom;

  constructor(props: RoomSpawnerProps) {
    this.scene = props.scene;
    this.player = props.player;
    this.entitiesContainer = props.entitiesContainer;
    this.cellCoordinates = props.cellCoordinates;
    this.roomSize = props.roomSize;
    this.doorWidthHalf = props.doorWidthHalf;
    this.onRoomVisit = props.onRoomVisit;
    this.onEnemySpawn = props.onEnemySpawn;
    const torchesCount = 8 * 3;
    this.torchesPool = new EntitiesPool(this.createTorch, torchesCount);
    this.fireFlaresPool = new EntitiesPool(this.createFireFlare, torchesCount);
    this.dungeonRoom = new DungeonRoom();
  };

  createNeighboringRooms(room: Room) {
    const roomType = this.getRandomRoomType();
    const neighboringRoom = this.createConnectedRoom(
      room.cellPosition,
      Direction.Top,
      roomType,
    );
    room.neighboringRooms.top = neighboringRoom;
    neighboringRoom.neighboringRooms.bottom = room;
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
    const worldCoordinates = this.cellCoordinates.toWorldCoordinates(cellPosition);
    const worldSize = this.cellCoordinates.toWorldCoordinates(this.roomSize);
    const constructorIndex =
      type === RoomType.Neutral ?
        -1 :
        this.dungeonRoom.getRandomRoomConstructorIndex();
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
      },
      neighboringRooms: {
        top: null,
        bottom: null,
      },
      entities: [],
      constructorIndex,
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

  moveTorchesToRoom(room: Room) {
    if (room.type === RoomType.Neutral) {
      return;
    }

    const torchesCount = 8;
    const torches = this.torchesPool.getEntities(torchesCount);
    const fireFlares = this.fireFlaresPool.getEntities(torchesCount);
    const yPos = this.cellCoordinates.size / 2;
    const wallShift = 1.1;
    const rotationAngle = -0.575959;
    const flareRotation = 1.5708;

    const axisBottom = 'x' as const;
    const axisLeft = 'z' as const;

    const flareRotationBottom = 0;
    const flareRotationLeft = flareRotation;
    const flareShiftAxisBottom = 'z' as const;
    const flareShiftAxisLeft = 'x' as const;
    const flareShiftBottom = -0.2;
    const flareShiftLeft = 0.2;
    const flareBottom = {
      rotation: flareRotationBottom,
      shiftAxis: flareShiftAxisBottom,
      shift: flareShiftBottom,
    };
    const flareTop = {
      rotation: flareRotationBottom,
      shiftAxis: flareShiftAxisBottom,
      shift: -flareShiftBottom,
    };
    const flareLeft = {
      rotation: flareRotationLeft,
      shiftAxis: flareShiftAxisLeft,
      shift: flareShiftLeft,
    };
    const flareRight = {
      rotation: flareRotationLeft,
      shiftAxis: flareShiftAxisLeft,
      shift: -flareShiftLeft,
    };

    [
      // Bottom
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x / 2 - this.roomSize.x / 4,
          room.cellPosition.y + this.roomSize.y - wallShift
        ),
        rotation: { axis: axisBottom, value: rotationAngle },
        flare: flareBottom,
      },
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x / 2 + this.roomSize.x / 4,
          room.cellPosition.y + this.roomSize.y - wallShift
        ),
        rotation: { axis: axisBottom, value: rotationAngle },
        flare: flareBottom,
      },
      // Top
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x / 2 - this.roomSize.x / 4,
          room.cellPosition.y + wallShift
        ),
        rotation: { axis: axisBottom, value: -rotationAngle },
        flare: flareTop,
      },
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x / 2 + this.roomSize.x / 4,
          room.cellPosition.y + wallShift
        ),
        rotation: { axis: axisBottom, value: -rotationAngle },
        flare: flareTop,
      },
      // Left
      {
        pos: new Vector2(
          room.cellPosition.x + wallShift,
          room.cellPosition.y + this.roomSize.y / 2 + this.roomSize.y / 4
        ),
        rotation: { axis: axisLeft, value: rotationAngle },
        flare: flareLeft,
      },
      {
        pos: new Vector2(
          room.cellPosition.x + wallShift,
          room.cellPosition.y + this.roomSize.y / 2 - this.roomSize.y / 4
        ),
        rotation: { axis: axisLeft, value: rotationAngle },
        flare: flareLeft,
      },
      // Right
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x - wallShift,
          room.cellPosition.y + this.roomSize.y / 2 + this.roomSize.y / 4
        ),
        rotation: { axis: axisLeft, value: -rotationAngle },
        flare: flareRight,
      },
      {
        pos: new Vector2(
          room.cellPosition.x + this.roomSize.x - wallShift,
          room.cellPosition.y + this.roomSize.y / 2 - this.roomSize.y / 4
        ),
        rotation: { axis: axisLeft, value: -rotationAngle },
        flare: flareRight,
      },
    ].forEach((info, index) => {
      torches[index].mesh.rotation[info.rotation.axis] = info.rotation.value;
      const pos = this.cellCoordinates.toWorldCoordinates(info.pos);
      torches[index].mesh.position.set(pos.x, yPos, pos.y);
      fireFlares[index].mesh.rotateY(info.flare.rotation);
      fireFlares[index].mesh.position.set(pos.x, yPos, pos.y);
      fireFlares[index].mesh.position[info.flare.shiftAxis] -= info.flare.shift;
    });
  }

  deleteNeighboringRooms(room: Room) {
    this.deleteRoomRelations(room);
  }

  deleteRoom(room: Room | null) {
    if (!room) {
      return;
    }
    this.scene.scene.remove(room.floor);
    room.walls.forEach(wall =>
      this.entitiesContainer.remove(wall.mesh)
    );
    room.entities.forEach(entity =>
      this.entitiesContainer.remove(entity.mesh)
    );
    const doors = room.doors;
    this.removeEntity(doors.top);
    this.removeEntity(doors.bottom);
    this.deleteRoomRelations(room);
  }

  removeEntity(entity: Entity | null) {
    if (!entity) {
      return;
    }
    this.entitiesContainer.remove(entity.mesh);
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
  }

  spawnRoomActivateTrigger(room: Room) {
    const color = new Color(0xFFFFFF);
    const size = new Vector2(this.cellCoordinates.size / 2, this.cellCoordinates.size / 2);
    const position = this.getRoomActivateTriggerPostition(room);
    const trigger = this.entitiesContainer.add(
      new Trigger({
        position: new Vector3(
          position.x,
          2.0,
          position.y,
        ),
        size: new Vector3(
          size.x,
          this.cellCoordinates.size,
          size.y,
        ),
        color,
        entitiesContainer: this.entitiesContainer,
        onTrigger: () => {
          this.onRoomVisit(room);
        },
      })
    ) as Trigger;
    return trigger;
  }

  getRoomActivateTriggerPostition(room: Room) {
    return this.cellCoordinates.toWorldCoordinates(
      new Vector2(
        room.cellPosition.x + this.roomSize.x / 2,
        room.cellPosition.y + this.roomSize.y - 2.5
      ),
    );
  }

  spawnRoomFloor(worldCoordinates: Vector2, worldSize: Vector2) {
    const floorGeometry = new PlaneGeometry(worldSize.x, worldSize.y);
    floorGeometry.applyMatrix4(new Matrix4().makeRotationX(-PI_2));
    const floorTexture = texturesStore.getTexture('floorTextureFile');
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.x = worldSize.x / 2;
    floorTexture.repeat.y = worldSize.y / 2;
    floorTexture.needsUpdate = true;
    const floorMaterial = new MeshLambertMaterial({ map: texturesStore.getTexture('floorTextureFile') });
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
    this.scene.scene.add(floorMesh);
    return floorMesh;
  }

  spawnRoomWalls(worldCoordinates: Vector2, worldSize: Vector2, roomType: RoomType): Entity[] {
    const doorPadding = this.doorWidthHalf * this.cellCoordinates.size;
    const halfWidth = worldSize.x / 2;
    const halfHeight = worldSize.y / 2;

    const wallsPositionSize = [
      // Top
      {
        position: worldCoordinates,
        size: new Vector2(halfWidth - doorPadding, this.cellCoordinates.size)
      },
      {
        position: new Vector2(worldCoordinates.x + halfWidth + doorPadding, worldCoordinates.y),
        size: new Vector2(halfWidth - doorPadding, this.cellCoordinates.size)
      },
      // Bottom
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + worldSize.y - this.cellCoordinates.size),
        size: new Vector2(halfWidth - doorPadding, this.cellCoordinates.size)
      },
      {
        position: new Vector2(worldCoordinates.x + halfWidth + doorPadding, worldCoordinates.y + worldSize.y - this.cellCoordinates.size),
        size: new Vector2(halfWidth - doorPadding, this.cellCoordinates.size)
      },
      // Left
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + this.cellCoordinates.size),
        size: new Vector2(this.cellCoordinates.size, halfHeight * 2 - this.cellCoordinates.size * 2)
      },
      // Right
      {
        position: new Vector2(worldCoordinates.x + worldSize.x - this.cellCoordinates.size, worldCoordinates.y + this.cellCoordinates.size),
        size: new Vector2(this.cellCoordinates.size, halfHeight * 2 - this.cellCoordinates.size * 2)
      },
    ];

    return wallsPositionSize.map(
      info => this.spawnWall(
        this.getCenterPosition(info.position, info.size),
        info.size,
        roomType,
        true,
        true,
      )
    );
  }

  getRoomConstructor(room: Room) {
    if (room.type === RoomType.Neutral) {
      return null;
    }
    return this.dungeonRoom.getRoomConstructor(room.constructorIndex);
  }

  fillRoomAfterVisit(room: Room) {
    const roomConstructor = this.getRoomConstructor(room);
    if (!roomConstructor) {
      return;
    }
    const cells = roomConstructor(this.roomSize).filter(cell =>
      cell.type === RoomCellType.Enemy
    );
    this.fillRoomCells(room, cells);
  }

  fillRoomBeforeVisit(room: Room) {
    const roomConstructor = this.getRoomConstructor(room);
    if (!roomConstructor) {
      return;
    }
    const cells = roomConstructor(this.roomSize).filter(cell =>
      cell.type === RoomCellType.DoorWall ||
      cell.type === RoomCellType.Wall
    );
    this.fillRoomCells(room, cells);
  }

  fillRoomCells(room: Room, cells: RoomCell[]) {
    cells.forEach(cell => {
      const cellPosition = cell.position.clone().add(room.cellPosition);
      const cellCoordinates =
        this.cellCoordinates.toWorldCoordinates(cellPosition);
      switch (cell.type) {
        case RoomCellType.Wall:
          this.fillWallCell(room, cell, cellCoordinates);
          break;
        case RoomCellType.DoorWall:
          this.fillDoorWallCell(room, cell, cellCoordinates);
          break;
        case RoomCellType.Enemy:
          this.fillEnemyCell(room, cell, cellCoordinates);
          break;
        default:
          break;
      }
    });
  }

  fillWallCell(room: Room, cell: WallRoomCell, cellCoordinates: Vector2) {
    const wallSizeValue = cell.mini ? 1 : this.cellCoordinates.size;
    const wallSize = new Vector2(wallSizeValue, wallSizeValue);
    const centerPosition = this.getCenterPosition(cellCoordinates, new Vector2(this.cellCoordinates.size, this.cellCoordinates.size));
    const wall =
      this.spawnWall(
        centerPosition,
        wallSize,
        room.type,
        false,
      )
    wall.tag = cell.tag;
    room.entities.push(wall);
  }

  fillDoorWallCell(room: Room, cell: RoomCell, cellCoordinates: Vector2) {
    const doorWall =
      this.spawnDoorWall(
        this.getCenterPosition(cellCoordinates, new Vector2(this.cellCoordinates.size, this.cellCoordinates.size)),
        new Vector2(this.cellCoordinates.size, this.cellCoordinates.size)
      );
    doorWall.tag = cell.tag;
    room.entities.push(doorWall);
  }

  fillEnemyCell(room: Room, cell: RoomCell, cellCoordinates: Vector2) {
    const onDeathCallback = cell.event ?
      () => {
        switch (cell.event?.type) {
          case RoomCellEventType.OpenDoorIfNoEntitiesWithTag:
            this.handleOpenDoorIfNoEntitiesWithTag(cell);
            break;
          default:
            break;
        }
      } :
      undefined;
    const enemy = this.onEnemySpawn(
      cellCoordinates,
      room.type,
      (cell as EnemyRoomCell).kind,
      onDeathCallback,
    );
    enemy.tag = cell.tag;
    room.entities.push(enemy);
  }

  handleOpenDoorIfNoEntitiesWithTag(cell: RoomCell) {
    const isHasEntityWithTag = this.scene.currentRoom.entities.some(
      entity => (Number(entity.hp) > 0) && (entity.tag === cell.tag)
    );
    if (isHasEntityWithTag) {
      return;
    }
    this.scene.currentRoom.entities.forEach(entity => {
      if (
        (entity.tag === cell.event?.targetEntityTag) &&
        (entity.type === ENTITY_TYPE.WALL)
      ) {
        (entity as Door).open();
      }
    });
  }

  spawnWall(coordinates: Vector2, size: Vector2, roomType: RoomType, withDecals: boolean, unbreakable?: boolean) {
    const isHorizontalWall = size.x > size.y;
    const props: WallProps = {
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      size: { width: size.x, height: WALL.SIZE, depth: size.y },
      isHorizontalWall: isHorizontalWall,
      withDecals,
      unbreakable,
    };
    const WallConstructor = this.getWallConstructor(roomType);
    const wall = this.entitiesContainer.add(
      new WallConstructor(props)
    );
    wall.setScaticPositionOptimizations(true);
    return wall;
  }

  getWallConstructor(roomType: RoomType) {
    switch (roomType) {
      case RoomType.Apathy:
        return WallApathy;
      case RoomType.Cowardice:
        return WallCowardice;
      case RoomType.SexualPerversions:
        return WallSexualPerversions;
      default:
        return WallNeutral;
    }
  }

  spawnRoomDoor(worldCoordinates: Vector2, worldSize: Vector2, direction: Direction) {
    const doorPadding = this.doorWidthHalf * this.cellCoordinates.size;
    const halfWidth = worldSize.x / 2;
    const halfHeight = worldSize.y / 2;
    const isVertical = (
      (direction === Direction.Top) || (direction === Direction.Bottom)
    );
    const doorX = (direction === Direction.Left) ?
      worldCoordinates.x :
      (direction === Direction.Right) ?
        worldCoordinates.x + worldSize.x - this.cellCoordinates.size :
        worldCoordinates.x + halfWidth - this.cellCoordinates.size;
    const doorY = (direction === Direction.Top) ?
      worldCoordinates.y :
      (direction === Direction.Bottom) ?
        worldCoordinates.y + worldSize.y - this.cellCoordinates.size :
        worldCoordinates.y + halfHeight - doorPadding;
    const doorWidth = isVertical ?
      doorPadding * 2 :
      this.cellCoordinates.size;
    const doorHeight = isVertical ?
      this.cellCoordinates.size :
      doorPadding * 2;
    const position = new Vector2(doorX, doorY);
    const size = new Vector2(doorWidth, doorHeight);

    return this.spawnDoor(
      this.getCenterPosition(position, size),
      size
    );
  }

  spawnDoor(coordinates: Vector2, size: Vector2) {
    const isHorizontalWall = size.width > size.height;
    const door = new Door({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      container: this.entitiesContainer,
      size: { width: size.width, height: WALL.SIZE, depth: size.height },
      isHorizontalWall: isHorizontalWall
    });
    this.entitiesContainer.add(door);
    return door;
  }

  spawnDoorWall(coordinates: Vector2, size: Vector2) {
    const isHorizontalWall = size.width > size.height;
    const doorWall = new DoorWall({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      container: this.entitiesContainer,
      size: { width: size.width, height: WALL.SIZE, depth: size.height },
      isHorizontalWall: isHorizontalWall
    });
    this.entitiesContainer.add(doorWall);
    return doorWall;
  }

  createTorch = () => {
    return this.entitiesContainer.add(new Torch({
      position: new Vector3(0, -1000, 0),
      player: this.player,
    }));
  }

  createFireFlare = () => {
    const fireFlare = new FireFlare({
      position: new Vector3(0, -1000, 0),
    });
    this.scene.scene.add(fireFlare.mesh);
    return fireFlare;
  }

  getCenterPosition(position: Vector2, size: Vector2) {
    return new Vector2(
      position.x + size.x / 2,
      position.y + size.y / 2
    );
  }

  getRandomRoomType() {
    const typeNumber = randomNumbers.getRandomInRange(0, 2);
    switch (typeNumber) {
      case 0:
        return RoomType.Apathy;
      case 1:
        return RoomType.Cowardice;
      default:
        return RoomType.SexualPerversions;
    }
  }

  getSeed() {
    return this.dungeonRoom.randomNumbersGenerator.seed;
  }
}
