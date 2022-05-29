import {
  PlaneGeometry,
  Mesh,
  Matrix4,
  MeshLambertMaterial,
  Vector2,
  Vector3,
  RepeatWrapping,
  Color,
  Scene,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { WALL, GAME_TEXTURE_NAME, PI_2 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { WallProps } from '@/Entities/Wall/Wall';
import { WallApathy } from '@/Entities/Wall/Inheritor/WallApathy';
import { WallCowardice } from '@/Entities/Wall/Inheritor/WallCowardice';
import { WallSexualPerversions } from '@/Entities/Wall/Inheritor/WallSexualPerversions';
import { WallNeutral } from '@/Entities/Wall/Inheritor/WallNeutral';
import { Door } from '@/Entities/Door/Door';
import { RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { Trigger } from '@/Entities/Trigger/Trigger';
import { Torch } from '@/Entities/Torch/Torch';
import {
  RoomCellType,
  RoomCell,
  RoomConstructors,
  getRandomRoomConstructor,
} from '@/dungeon/DungeonRoom';
import { mindState } from '@/MindState';
import { CellCoordinates } from '@/scenes/CellCoordinates';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

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

interface RoomTorches {
  apathy: RoomTorchesPool,
  cowardice: RoomTorchesPool,
  sexualPerversions: RoomTorchesPool,
  apathyGray: RoomTorchesPool,
  cowardiceGray: RoomTorchesPool,
  sexualPerversionsGray: RoomTorchesPool,
}

type RoomTorchesPool = [Torch, Torch, Torch, Torch];

export interface RoomSpawnerProps {
  scene: Scene;
  player: Player;
  entitiesContainer: EntitiesContainer;
  cellCoordinates: CellCoordinates;
  roomSize: Vector2;
  doorWidthHalf: number;
  onRoomVisit: (room: Room) => void;
  onSpawnEnemy: (cellCoordinates: Vector2, roomType: RoomType) => void;
}

export class RoomSpawner {
  scene: RoomSpawnerProps['scene'];
  player: RoomSpawnerProps['player'];
  entitiesContainer: RoomSpawnerProps['entitiesContainer'];
  cellCoordinates: RoomSpawnerProps['cellCoordinates'];
  roomSize: RoomSpawnerProps['roomSize'];
  doorWidthHalf: RoomSpawnerProps['doorWidthHalf'];
  onRoomVisit: RoomSpawnerProps['onRoomVisit'];
  onSpawnEnemy: RoomSpawnerProps['onSpawnEnemy'];
  torches: RoomTorches;

  constructor(props: RoomSpawnerProps) {
    this.scene = props.scene;
    this.player = props.player;
    this.entitiesContainer = props.entitiesContainer;
    this.cellCoordinates = props.cellCoordinates;
    this.roomSize = props.roomSize;
    this.doorWidthHalf = props.doorWidthHalf;
    this.onRoomVisit = props.onRoomVisit;
    this.onSpawnEnemy = props.onSpawnEnemy;
    this.torches = this.getSceneTorches();
  };

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
    const worldCoordinates = this.cellCoordinates.toWorldCoordinates(cellPosition);
    const worldSize = this.cellCoordinates.toWorldCoordinates(this.roomSize);
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

  moveTorchesToRoom(room: Room) {
    if (room.type === RoomType.Neutral) {
      return;
    }
    const torches = this.getRoomTorches(room.type);
    const posO = this.cellCoordinates.toWorldCoordinates(
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
    const pos1 = this.cellCoordinates.toWorldCoordinates(
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
    const pos2 = this.cellCoordinates.toWorldCoordinates(
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
    const pos3 = this.cellCoordinates.toWorldCoordinates(
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

  removeEntity(entity: Entity | null) {
    if (!entity) {
      return;
    }
    this.entitiesContainer.remove(entity.actor.mesh);
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

  spawnRoomActivateTrigger(room: Room) {
    const color = this.getTriggerColor(room);
    const size = new Vector2(this.cellCoordinates.size, this.cellCoordinates.size);
    const position = this.getCenterPosition(
      this.cellCoordinates.toWorldCoordinates(
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
          this.cellCoordinates.size / 2,
          position.y,
        ),
        size: new Vector3(
          size.x,
          this.cellCoordinates.size,
          size.y,
        ),
        color: new Color(color),
        entitiesContainer: this.entitiesContainer,
        onTrigger: () => this.onRoomVisit(room),
      })
    ) as Trigger;
    trigger.setIsNotMovingOptimizations(true);
    return trigger;
  }

  getTriggerColor(room: Room) {
    return this.getMindeStateLevel(room.type) > 0 ? 0x333333 : 0xFF0000;
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
        size: new Vector2(this.cellCoordinates.size, halfHeight - this.cellCoordinates.size - doorPadding)
      },
      {
        position: new Vector2(worldCoordinates.x, worldCoordinates.y + halfHeight + doorPadding),
        size: new Vector2(this.cellCoordinates.size, halfHeight - this.cellCoordinates.size - doorPadding)
      },
      // Right
      {
        position: new Vector2(worldCoordinates.x + worldSize.x - this.cellCoordinates.size, worldCoordinates.y + this.cellCoordinates.size),
        size: new Vector2(this.cellCoordinates.size, halfHeight - this.cellCoordinates.size - doorPadding)
      },
      {
        position: new Vector2(worldCoordinates.x + worldSize.x - this.cellCoordinates.size, worldCoordinates.y + halfHeight + doorPadding),
        size: new Vector2(this.cellCoordinates.size, halfHeight - this.cellCoordinates.size - doorPadding)
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
      const roomCoordinates = this.cellCoordinates.toWorldCoordinates(room.cellPosition);
      const cellCoordinates =
        this.cellCoordinates.toWorldCoordinates(cell.position).add(roomCoordinates);
      switch (cell.type) {
        case RoomCellType.Wall:
          room.entities.push(
            this.spawnWall(
              this.getCenterPosition(cellCoordinates, new Vector2(this.cellCoordinates.size, this.cellCoordinates.size)),
              new Vector2(this.cellCoordinates.size, this.cellCoordinates.size),
              room.type,
            )
          );
          break;
        case RoomCellType.Enemy:
          this.onSpawnEnemy(cellCoordinates, room.type);
          break;
        default:
          break;
      }
    });
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
      player: this.player,
      isHorizontalWall: isHorizontalWall
    });
    this.entitiesContainer.add(door);
    return door;
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

  getCenterPosition(position: Vector2, size: Vector2) {
    return new Vector2(
      position.x + size.x / 2,
      position.y + size.y / 2
    );
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
}
