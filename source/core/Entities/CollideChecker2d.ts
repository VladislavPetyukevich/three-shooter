import { Box3, Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';

interface CollisionsResult {
  entities: Entity[];
}

interface EntityBounds {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

interface EntityRecord {
  entity: Entity;
  bounds: EntityBounds;
}

interface MapRecord {
  entities: EntityRecord[];
}

type Map = MapRecord[][];

interface CollideCheckerProps {
  cellSize: number;
}

export class CollideChecker2d {
  map: Map;
  cellSize: number;
  mapMeshIdToMapCoordinates: { [meshId: number]: { x: number, y: number }[] };

  constructor(props: CollideCheckerProps) {
    this.map = [];
    this.cellSize = props.cellSize;
    this.mapMeshIdToMapCoordinates = [];
  }

  addEntity(entity: Entity) {
    const bbox = new Box3().setFromObject(entity.actor.mesh);
    const bounds: EntityBounds = {
      xMin: bbox.min.x,
      xMax: bbox.max.x,
      zMin: bbox.min.z,
      zMax: bbox.max.z,
    };
    const minCellX = this.getCellCoordinate(bounds.xMin);
    const maxCellX = this.getCellCoordinate(bounds.xMax);
    const minCellY = this.getCellCoordinate(bounds.zMin);
    const maxCellY = this.getCellCoordinate(bounds.zMax);

    for (let currCellX = minCellX; currCellX <= maxCellX; currCellX++) {
      for (let currCellY = minCellY; currCellY <= maxCellY; currCellY++) {
        this.addEntityToMap(currCellX, currCellY, { entity, bounds });
      }
    }

  }

  detectCollisions(entity: Entity, newPosition: Vector3): CollisionsResult {
    const collisionsResult: CollisionsResult = { entities: [] };
    if (entity.isCollideTransparent) {
      return collisionsResult;
    }
    const entityGeometrySize = this.getSize(entity);
    var bounds = {
      xMin: newPosition.x - entityGeometrySize.width / 2,
      xMax: newPosition.x + entityGeometrySize.width / 2,
      yMin: newPosition.y - entityGeometrySize.height / 2,
      yMax: newPosition.y + entityGeometrySize.height / 2,
      zMin: newPosition.z - entityGeometrySize.width / 2,
      zMax: newPosition.z + entityGeometrySize.width / 2,
    };
    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[entity.actor.mesh.id];
    if (!entityMapCoordinates) {
      return collisionsResult;
    }

    entityMapCoordinates.forEach(coordinates => {
      if (!(this.map[coordinates.x] && this.map[coordinates.x][coordinates.y])) {
        return;
      }

      this.map[coordinates.x][coordinates.y].entities.forEach(entityToCheck => {
        if (entityToCheck.entity.isCollideTransparent) {
          return;
        }
        if (entityToCheck.entity.actor.mesh.id === entity.actor.mesh.id) {
          return;
        }
        if (
          (bounds.xMin <= entityToCheck.bounds.xMax && bounds.xMax >= entityToCheck.bounds.xMin) &&
          (bounds.zMin <= entityToCheck.bounds.zMax && bounds.zMax >= entityToCheck.bounds.zMin)
        ) {
          collisionsResult.entities.push(entityToCheck.entity);
        }
      });

    });

    return collisionsResult;
  }

  removeEntity(meshId: number) {
    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[meshId];
    if (!entityMapCoordinates) {
      return;
    }
    entityMapCoordinates.forEach(
      coordinates => this.removeEntityFromMap(coordinates.x, coordinates.y, meshId)
    );
    delete this.mapMeshIdToMapCoordinates[meshId];
  }

  updateEntityPosition(entity: Entity, newPosition: Vector3) {
    entity.actor.mesh.position.set(
      newPosition.x,
      newPosition.y,
      newPosition.z
    );

    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[entity.actor.mesh.id];
    if (!entityMapCoordinates) {
      return;
    }
    entityMapCoordinates.forEach(
      coordinates => this.removeEntityFromMap(coordinates.x, coordinates.y, entity.actor.mesh.id)
    );
    delete this.mapMeshIdToMapCoordinates[entity.actor.mesh.id];

    this.addEntity(entity);
  }

  removeEntityFromMap(x: number, y: number, entityMeshId: number) {
    const mapCell = this.map[x][y];
    if (!mapCell) {
      throw new Error('Entity not found');
    }
    for (let i = mapCell.entities.length; i--;) {
      if (mapCell.entities[i].entity.actor.mesh.id === entityMeshId) {
        mapCell.entities.splice(i, 1);
        break;
      }
    }
  }

  addEntityToMap(x: number, y: number, entityRecord: EntityRecord) {
    if (!this.map[x]) {
      this.map[x] = [];
    }
    if (this.map[x][y]) {
      this.map[x][y].entities.push(entityRecord);
    } else {
      this.map[x][y] = { entities: [entityRecord] };
    }

    if (this.mapMeshIdToMapCoordinates[entityRecord.entity.actor.mesh.id]) {
      this.mapMeshIdToMapCoordinates[entityRecord.entity.actor.mesh.id].push({ x, y });
    } else {
      this.mapMeshIdToMapCoordinates[entityRecord.entity.actor.mesh.id] = [{ x, y }];
    }
  }

  getSize(entity: Entity): { width: number; height: number } {
    if (entity.actor.mesh.geometry.type === 'BoxGeometry') {
      return {
        width: (<any>entity.actor.mesh.geometry).parameters.width,
        height: (<any>entity.actor.mesh.geometry).parameters.height
      };
    }
    if (entity.actor.mesh.geometry.type === 'SphereGeometry') {
      return {
        width: (<any>entity.actor.mesh.geometry).parameters.radius * 2,
        height: (<any>entity.actor.mesh.geometry).parameters.radius * 2
      };
    }
    throw new Error(`geometry type are not suported: ${entity.actor.mesh.geometry.type}`);
  }

  getCellCoordinate(coordinate: number) {
    return Math.trunc(coordinate / this.cellSize);
  }
}
