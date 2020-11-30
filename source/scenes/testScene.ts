import {
  PlaneGeometry,
  Mesh,
  AmbientLight,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
  Vector3,
  Fog
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { PI_180, ENTITY_TYPE } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { PLAYER } from '@/constants';
import { Wall } from '@/Entities/Wall/Wall';
import { Enemy } from '@/Entities/Enemy/Enemy';
import { DungeonGenerator, DungeonCellType } from '@/dungeon/DungeonGenerator';

const calculateCirclePoints = (angleStep: number, radius: number) => {
  const points = [];
  const maxAngle = 360;
  for (let angle = 0; angle < maxAngle; angle += angleStep) {
    const angleRadians = angle * PI_180;
    points.push({
      x: Math.cos(angleRadians) * radius,
      y: Math.sin(angleRadians) * radius
    });
  }
  return points;
};

export class TestScene extends BasicScene {
  pointLight: PointLight;
  player: Player;
  mapCellSize: number;
  dungeonCellsPosition: number[][];

  constructor(props: BasicSceneProps) {
    super(props);
    this.mapCellSize = 3;

    // lights
    this.scene.add(new AmbientLight(0x404040, 0.15));
    this.pointLight = new PointLight(0xffffff, 50, 100);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    this.scene.fog = new Fog(0x000000, 0.15, 80);

    const floorGeometry = new PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floormaterial = new MeshPhongMaterial({ color: 'white' });
    const floormesh = new Mesh(floorGeometry, floormaterial);
    floormesh.receiveShadow = true;
    this.scene.add(floormesh);

    this.player = this.entitiesContainer.add(
      new Player({
        camera: this.camera,
        position: new Vector3(0, PLAYER.BODY_HEIGHT, 0),
        container: this.entitiesContainer,
        audioListener: this.audioListener
      })
    );

    const mapDictionary = {
      1: ENTITY_TYPE.WALL,
      2: ENTITY_TYPE.ENEMY,
      3: ENTITY_TYPE.PLAYER
    };

    const dungeonGenerator = new DungeonGenerator({
      dungeonSize: { width: 100, height: 100 },
      roomSize: { width: 10, height: 10 }
    });
    dungeonGenerator.generate();
    this.dungeonCellsPosition = [];
    const cells = dungeonGenerator.cells();
    cells.forEach(row => {
      row.forEach(cell => {
        if (!cell) {
          return;
        }
        this.dungeonCellsPosition.push(
          [
            cell.position.x, cell.position.y,
            cell.position.x + 10, cell.position.y + 10
          ]
        );
      });
    });
    const dungeon: (3 | 1 | 0)[][] = dungeonGenerator.dungeon().map(
      dungeonRow => dungeonRow.map(dungeonCell => {
        if (dungeonCell === DungeonCellType.Wall) {
          return 1;
        }

        return 0;
      })
    );
    dungeon[44][44] = 3;
    this.loadMap(dungeon, mapDictionary, this.mapCellSize);
  }

  loadMap(map: number[][], dictionary: { [mapKey: number]: ENTITY_TYPE }, cellSize: number) {
    for (let mapY = 0; mapY < map.length; mapY++) {
      for (let mapX = 0; mapX < map[mapY].length; mapX++) {
        const mapRecord = map[mapY][mapX];
        const entityType = dictionary[mapRecord];
        if (!entityType) {
          continue;
        }
        if (entityType === ENTITY_TYPE.WALL) {
          this.spawnWall({ x: mapX * cellSize, y: mapY * cellSize });
        }
        if (entityType === ENTITY_TYPE.ENEMY) {
          this.spawnEnemy({ x: mapX * cellSize, y: mapY * cellSize });
        }
        if (entityType === ENTITY_TYPE.PLAYER) {
          this.player.actor.mesh.position.set(
            mapX * cellSize,
            PLAYER.BODY_HEIGHT,
            mapY * cellSize
          );
        }
      }
    }
  }


  spawnWall(coordinates: { x: number, y: number }) {
    const wall = new Wall({
      position: new Vector3(coordinates.x, 1.5, coordinates.y)
    });
    this.entitiesContainer.add(wall);
  }

  spawnEnemy(coordinates: { x: number, y: number }) {
    const enemy = new Enemy({
      position: { x: coordinates.x, y: PLAYER.BODY_HEIGHT, z: coordinates.y },
      player: this.player,
      container: this.entitiesContainer,
      audioListener: this.audioListener
    });
    this.entitiesContainer.add(enemy);
  }

  update(delta: number) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.mesh.position);
    const playerCellX = ~~(this.player.actor.mesh.position.x / this.mapCellSize);
    const playerCellY = ~~(this.player.actor.mesh.position.z / this.mapCellSize);
    for(let i = this.dungeonCellsPosition.length; i--;) {
      const cell = this.dungeonCellsPosition[i];
      const inX = (playerCellX > cell[0]) && (playerCellX < cell[2]);
      const inY = (playerCellY > cell[1]) && (playerCellY < cell[3]);
      if (inX && inY) {
        console.log('current room index: ', i);
        break;
      }
    }
  }
}
