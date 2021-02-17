import {
  PlaneGeometry,
  Mesh,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
  Vector3,
  Fog,
  Light,
  RepeatWrapping
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { PLAYER, WALL, GAME_TEXTURE_NAME } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { Wall } from '@/Entities/Wall/Wall';
import { Door } from '@/Entities/Door/Door';
import { Enemy } from '@/Entities/Enemy/Enemy';
import { DungeonGenerator, DungeonCellType } from '@/dungeon/DungeonGenerator';
import { RoomCellType, rooms } from '@/dungeon/DungeonRoom';
import { hud } from '@/HUD/HUD';

interface Size {
  width: number;
  height: number;
}

export class TestScene extends BasicScene {
  pointLight: PointLight;
  player: Player;
  mapCellSize: number;
  dungeonSize: Size;
  dungeonRoomSize: Size;
  dungeonCellsPosition: number[][];
  dungeonCellsPositionToLight: number[];
  dungeonCellDoors: Door[][];
  currentRoomIndex: number | null;
  dungeonRoomEnimiesCount: number;
  doors: Door[];
  visitedRooms: Set<number>;

  constructor(props: BasicSceneProps) {
    super(props);
    this.mapCellSize = 3;
    this.dungeonSize = { width: 200, height: 200 };
    this.dungeonRoomSize = { width: 20, height: 20 };
    this.currentRoomIndex = null;
    this.dungeonCellsPositionToLight = [];
    this.dungeonRoomEnimiesCount = 0;
    this.visitedRooms = new Set();
    this.doors = [];
    this.dungeonCellDoors = [];

    // lights
    // this.scene.add(new AmbientLight(0xFF0000, 1));
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

    const floorGeometry = new PlaneGeometry(1000, 1000);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floorTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.floorTextureFile);
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.x = floorTexture.repeat.y = 1000 / 1;
    floorTexture.needsUpdate = true;
    const floormaterial = new MeshPhongMaterial({ map: texturesStore.getTexture(GAME_TEXTURE_NAME.floorTextureFile) });
    const floormesh = new Mesh(floorGeometry, floormaterial);
    floormesh.receiveShadow = true;
    this.scene.add(floormesh);

    const roofGeometry = new PlaneGeometry(1000, 1000);
    roofGeometry.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
    const roofMaterial = new MeshPhongMaterial({ color: 'white' });
    const roofMesh = new Mesh(roofGeometry, roofMaterial);
    roofMesh.position.y = WALL.SIZE;
    this.scene.add(roofMesh);

    this.player = this.entitiesContainer.add(
      new Player({
        camera: this.camera,
        position: new Vector3(0, PLAYER.BODY_HEIGHT, 0),
        container: this.entitiesContainer,
        audioListener: this.audioListener
      })
    );

    const dungeonGenerator = new DungeonGenerator({
      dungeonSize: this.dungeonSize,
      roomSize: this.dungeonRoomSize
    });
    dungeonGenerator.generate();
    this.dungeonCellsPosition = [];
    const cells = dungeonGenerator.cells();
    hud.updateMap(cells);
    cells.forEach(row => {
      row.forEach(cell => {
        if (!cell) {
          return;
        }
        this.dungeonCellsPosition.push(
          [
            cell.position.x,
            cell.position.y,
            cell.position.x + this.dungeonRoomSize.width,
            cell.position.y + this.dungeonRoomSize.height
          ]
        );
        const roomLight = this.spawnLightInRoom(cell.position.x, cell.position.y);
        this.dungeonCellsPositionToLight[this.dungeonCellsPosition.length - 1] = roomLight.id;
      });
    });
    const playerX = this.dungeonCellsPosition[0][0] + this.mapCellSize;
    const playerY = this.dungeonCellsPosition[0][1] + this.mapCellSize;
    this.player.actor.mesh.position.x = playerX * this.mapCellSize;
    this.player.actor.mesh.position.z = playerY * this.mapCellSize;
    dungeonGenerator.dungeon().forEach(el => {
      if (el.type === DungeonCellType.Wall) {
        const wallPos = this.convertToSceneCoordinates({
          x: el.fillRect.position.x,
          y: el.fillRect.position.y
        });
        const wallSize = this.convertToSceneCoordinates({
          x: el.fillRect.size.width,
          y: el.fillRect.size.height
        });
        const translateX = (wallSize.x / 2);
        const translateY = (wallSize.y / 2);
        this.spawnWall(
          { x: wallPos.x + translateX, y: wallPos.y + translateY },
          { width: wallSize.x, height: wallSize.y }
        );
      }
      if (el.type === DungeonCellType.Door) {
        const wallPos = this.convertToSceneCoordinates({
          x: el.fillRect.position.x,
          y: el.fillRect.position.y
        });
        const wallSize = this.convertToSceneCoordinates({
          x: el.fillRect.size.width,
          y: el.fillRect.size.height
        });
        const translateX = (wallSize.x / 2);
        const translateY = (wallSize.y / 2);
        const door = this.spawnDoor(
          { x: wallPos.x + translateX, y: wallPos.y + translateY },
          { width: wallSize.x, height: wallSize.y }
        );
        this.dungeonCellsPosition.forEach((cellPos, index) => {
          const diffTop = Math.abs(el.fillRect.position.y - cellPos[1]);
          const diffBottom = Math.abs(el.fillRect.position.y + el.fillRect.size.height - cellPos[3]);
          const shift = 1;
          if (
            (diffTop <= el.fillRect.size.height + shift) ||
            (diffBottom <= el.fillRect.size.height + shift)
          ) {
            this.addDungeonCellDoor(index, door);
            return;
          }
          const diffLeft = Math.abs(el.fillRect.position.x - cellPos[0]);
          const diffRight = Math.abs(el.fillRect.position.x + el.fillRect.size.width - cellPos[2]);
          if (
            (diffLeft < el.fillRect.size.width) ||
            (diffRight < el.fillRect.size.width)
          ) {
            this.addDungeonCellDoor(index, door);
            return;
          }
        });
      }
    });
  }

  addDungeonCellDoor(index: number, door: Door) {
    if (!this.dungeonCellDoors[index]) {
      this.dungeonCellDoors[index] = [door];
    } else {
      this.dungeonCellDoors[index].push(door);
    }
  }

  spawnWall(coordinates: { x: number, y: number }, size: { width: number, height: number }) {
    const isHorizontalWall = size.width > size.height;
    const wall = new Wall({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      size: { width: size.width, height: WALL.SIZE, depth: size.height },
      isHorizontalWall: isHorizontalWall
    });
    this.entitiesContainer.add(wall);
  }

  spawnDoor(coordinates: { x: number, y: number }, size: { width: number, height: number }) {
    const isHorizontalWall = size.width > size.height;
    const door = new Door({
      position: new Vector3(coordinates.x, 1.5, coordinates.y),
      container: this.entitiesContainer,
      size: { width: size.width, height: WALL.SIZE, depth: size.height },
      player: this.player,
      isHorizontalWall: isHorizontalWall
    });
    door.close();
    this.doors.push(door);
    this.entitiesContainer.add(door);
    return door;
  }

  lockUnlockAllDoors(roomIndex: number, isLock: boolean) {
    if (!this.dungeonCellDoors[roomIndex]) {
      return;
    }
    this.dungeonCellDoors[roomIndex].forEach(door => {
      if (isLock) {
        door.close();
      } else {
        door.open();
      }
    });
  }

  onEnemyDeath = () => {
    this.dungeonRoomEnimiesCount--;
    if (this.dungeonRoomEnimiesCount === 0) {
      if (typeof this.currentRoomIndex === 'number') {
        this.lockUnlockAllDoors(this.currentRoomIndex, false);
        this.onOffLightInRoom(this.currentRoomIndex, true);
      }
    }
  }

  spawnEnemy(coordinates: { x: number, y: number }) {
    const enemy = new Enemy({
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener
    });
    enemy.onDeath(this.onEnemyDeath);
    return this.entitiesContainer.add(enemy);
  }

  convertToSceneCoordinates(coordinates: { x: number, y: number }) {
    return {
      x: coordinates.x * this.mapCellSize,
      y: coordinates.y * this.mapCellSize
    };
  }

  spawnLightInRoom(roomX: number, roomY: number) {
    const pointLight = new PointLight(0xffffff, 0, 1000);
    const lightX = roomX + ~~(this.dungeonRoomSize.width / 2);
    const lightY = roomY + ~~(this.dungeonRoomSize.height / 2);
    const sceneCoordinates = this.convertToSceneCoordinates({ x: lightX, y: lightY });
    pointLight.position.set(sceneCoordinates.x, 15, sceneCoordinates.y);
    this.scene.add(pointLight);
    return pointLight;
  }

  onOffLightInRoom(roomIndex: number, isOn: boolean) {
    const lightId = this.dungeonCellsPositionToLight[roomIndex];
    const light = this.scene.getObjectById(lightId) as Light;
    if (isOn) {
      light.intensity = 100;
    } else {
      light.intensity = 0;
    }
  }

  fillRoomRandom(roomX: number, roomY: number) {
    this.dungeonRoomEnimiesCount = 0;
    const cells = rooms[0](this.dungeonRoomSize);
    cells.forEach(cell => {
      const sceneCoordinates = this.convertToSceneCoordinates({
        x: roomX + cell.position.x,
        y: roomY + cell.position.y
      });
      switch (cell.type) {
        case RoomCellType.Enemy:
          this.spawnEnemy(sceneCoordinates)
          this.dungeonRoomEnimiesCount++;
          break;
      }
    });
  }

  getPlayerCell() {
    const playerCellX = ~~(this.player.actor.mesh.position.x / this.mapCellSize);
    const playerCellY = ~~(this.player.actor.mesh.position.z / this.mapCellSize);
    const roomPadding = 3;
    for(let i = this.dungeonCellsPosition.length; i--;) {
      if (i === this.currentRoomIndex) {
        continue;
      }
      const cell = this.dungeonCellsPosition[i];
      const inX = (playerCellX > cell[0] + roomPadding) && (playerCellX < cell[2] - roomPadding);
      const inY = (playerCellY > cell[1] + roomPadding) && (playerCellY < cell[3] - roomPadding);
      if (inX && inY) {
        return { value: cell, index: i };
      }
    }
  }

  handleRoomChange(newCell: number[], newCellIndex: number) {
    this.currentRoomIndex = newCellIndex;
    this.visitedRooms.add(newCellIndex);
    this.lockUnlockAllDoors(newCellIndex, true);
    this.fillRoomRandom(newCell[0], newCell[1]);
  }

  update(delta: number) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.mesh.position);
    const playerCell = this.getPlayerCell();
    if (playerCell && !this.visitedRooms.has(playerCell.index)) {
      this.handleRoomChange(playerCell.value, playerCell.index);
    }
  }
}
