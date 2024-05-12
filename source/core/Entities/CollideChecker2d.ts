import { Box3, Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';

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

interface CollideCheckerProps {
  cellSize: number;
}

interface Position {
  x: number;
  y: number;
}

export class CollideChecker2d {
  map: Map<string, MapRecord>;
  cellSize: number;
  mapMeshIdToMapCoordinates: { [meshId: number]: Position[] };

  constructor(props: CollideCheckerProps) {
    this.map = new Map();
    this.cellSize = props.cellSize;
    this.mapMeshIdToMapCoordinates = [];
  }

  addEntity(entity: Entity) {
    const bbox = new Box3().setFromObject(entity.mesh);
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
        this.addEntityToMap(
          { x: currCellX, y: currCellY },
          { entity, bounds }
        );
      }
    }

  }

  detectCollisions(entity: Entity, newPosition: Vector3): Entity[] {
    const collisionsResult: Entity[] = [];
    if (entity.isCollideTransparent) {
      return collisionsResult;
    }
    const entityGeometrySize = this.getSize(entity);
    const bounds = {
      xMin: newPosition.x - entityGeometrySize.width / 2,
      xMax: newPosition.x + entityGeometrySize.width / 2,
      zMin: newPosition.z - entityGeometrySize.height / 2,
      zMax: newPosition.z + entityGeometrySize.height / 2,
    };
    const entityMapCoordinates = this.getEntityMapCoordinates(entity);

    entityMapCoordinates.forEach(coordinates => {
      const mapRecord = this.getMapRecord(coordinates);
      if (!mapRecord) {
        return;
      }

      mapRecord.entities.forEach(entityToCheck => {
        if (entityToCheck.entity.isCollideTransparent) {
          return;
        }
        if (entityToCheck.entity.mesh.id === entity.mesh.id) {
          return;
        }
        if (
          (bounds.xMin <= entityToCheck.bounds.xMax && bounds.xMax >= entityToCheck.bounds.xMin) &&
          (bounds.zMin <= entityToCheck.bounds.zMax && bounds.zMax >= entityToCheck.bounds.zMin)
        ) {
          collisionsResult.push(entityToCheck.entity);
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
      coordinates => this.removeEntityFromMap(coordinates, meshId)
    );
    delete this.mapMeshIdToMapCoordinates[meshId];
  }

  updateEntityPosition(entity: Entity, newPosition: Vector3) {
    entity.mesh.position.set(
      newPosition.x,
      newPosition.y,
      newPosition.z
    );

    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[entity.mesh.id];
    if (!entityMapCoordinates) {
      return;
    }
    entityMapCoordinates.forEach(
      coordinates => this.removeEntityFromMap(coordinates, entity.mesh.id)
    );
    delete this.mapMeshIdToMapCoordinates[entity.mesh.id];

    this.addEntity(entity);
  }

  removeEntityFromMap(position: Position, entityMeshId: number) {
    const mapCell = this.getMapRecord(position);
    if (!mapCell) {
      throw new Error('Entity not found');
    }
    for (let i = mapCell.entities.length; i--;) {
      if (mapCell.entities[i].entity.mesh.id === entityMeshId) {
        mapCell.entities.splice(i, 1);
        break;
      }
    }
  }

  addEntityToMap(position: Position, entityRecord: EntityRecord) {
    const positionHash = this.getPositionHash(position);
    const mapRecord = this.map.get(positionHash);
    if (mapRecord) {
      mapRecord.entities.push(entityRecord);
    } else {
      this.map.set(positionHash, { entities: [entityRecord] });
    }

    if (this.mapMeshIdToMapCoordinates[entityRecord.entity.mesh.id]) {
      this.mapMeshIdToMapCoordinates[entityRecord.entity.mesh.id].push(position);
    } else {
      this.mapMeshIdToMapCoordinates[entityRecord.entity.mesh.id] = [position];
    }
  }

  getEntityMapCoordinates(entity: Entity) {
    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[entity.mesh.id];
    if (entityMapCoordinates) {
      return entityMapCoordinates;
    }
    const mapCoordinates: Position[] = [];
    const bbox = new Box3().setFromObject(entity.mesh);
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
        mapCoordinates.push({ x: currCellX, y: currCellY });
      }
    }
    return mapCoordinates;
  }

  getSize(entity: Entity): { width: number; height: number } {
    if (entity.mesh.geometry.type === 'BoxGeometry') {
      return {
        width: (<any>entity.mesh.geometry).parameters.width,
        height: (<any>entity.mesh.geometry).parameters.depth
      };
    }
    if (entity.mesh.geometry.type === 'SphereGeometry') {
      return {
        width: (<any>entity.mesh.geometry).parameters.radius * 2,
        height: (<any>entity.mesh.geometry).parameters.radius * 2
      };
    }
    if (entity.mesh.geometry.type === 'CylinderGeometry') {
      return {
        width: (<any>entity.mesh.geometry).parameters.height,
        height: (<any>entity.mesh.geometry).parameters.height
      };
    }
    throw new Error(`geometry type are not suported: ${entity.mesh.geometry.type}`);
  }

  getMapRecord(position: Position) {
    return this.map.get(this.getPositionHash(position));
  }

  getPositionHash(position: Position) {
    return '' + position.x + position.y;
  }

  getCellCoordinate(coordinate: number) {
    return Math.round(coordinate / this.cellSize);
  }

  getCellOriginalCoordinate(coordinate: number) {
    return coordinate * this.cellSize;
  }

  getMeshCoordinates(meshId: number) {
    return this.mapMeshIdToMapCoordinates[meshId];
  }
}
