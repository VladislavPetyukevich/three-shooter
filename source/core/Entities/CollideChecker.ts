import { Box3, BufferGeometry, Raycaster } from 'three';
import { Entity } from '@/core/Entities/Entity';

interface CollideCheckerProps {
  cellSize: number;
}

interface MapRecord {
  x: number;
  y: number;
  entities: Entity[];
}

export class CollideChecker {
  map: MapRecord[];
  cellSize: number;
  mapMeshIdToMapCoordinates: { [meshId: number]: { x: number, y: number }[] };

  constructor(props: CollideCheckerProps) {
    this.map = [];
    this.cellSize = props.cellSize;
    this.mapMeshIdToMapCoordinates = [];
  }

  getCellCoordinate(coordinate: number) {
    return Math.trunc(coordinate / this.cellSize);
  }

  addEntity(entity: Entity) {
    const box = new Box3().setFromObject(entity.actor.mesh);
    const minCellX = this.getCellCoordinate(box.min.x);
    const maxCellX = this.getCellCoordinate(box.max.x);
    const minCellY = this.getCellCoordinate(box.min.z);
    const maxCellY = this.getCellCoordinate(box.max.z);

    for (let currCellX = minCellX; currCellX <= maxCellX; currCellX++) {
      for (let currCellY = minCellY; currCellY <= maxCellY; currCellY++) {
        this.addEntityToMap(currCellX, currCellY, entity);
        const mapCell = this.getMapCell(currCellX, currCellY);
        if (mapCell && mapCell.entities.length > 1) {
          this.checkCollisions(entity, mapCell.entities);
        }
      }
    }
  }

  removeEntity(meshId: number) {
    const entityMapCoordinates = this.mapMeshIdToMapCoordinates[meshId];
    if (!entityMapCoordinates) {
      throw new Error('Entity not found');
    }
    entityMapCoordinates.forEach(
      coordinates => this.removeEntityFromMap(coordinates.x, coordinates.y, meshId)
    );
    delete this.mapMeshIdToMapCoordinates[meshId];
  }

  updateEntityPosition(entity: Entity) {
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

  addEntityToMap(x: number, y: number, entity: Entity) {
    const mapCell = this.getMapCell(x, y);
    if (mapCell) {
      mapCell.entities.push(entity);
    } else {
      this.map.push({ x, y, entities: [entity] });
    }

    const mapIdRecord = this.mapMeshIdToMapCoordinates[entity.actor.mesh.id];
    if (mapIdRecord) {
      this.mapMeshIdToMapCoordinates[entity.actor.mesh.id].push({ x, y });
    } else {
      this.mapMeshIdToMapCoordinates[entity.actor.mesh.id] = [{ x, y }];
    }
  }

  removeEntityFromMap(x: number, y: number, meshId: number) {
    const mapCell = this.getMapCell(x, y);
    if (!mapCell) {
      throw new Error('Entity not found');
    }
    this.map = this.map.map(record => ({
      ...record,
      entities: record.entities.filter(entityRecord => entityRecord.actor.mesh.id !== meshId)
    }));
  }

  getMapCell(x: number, y: number) {
    return this.map.find(record => (record.x === x) && (record.y === y));
  }

  checkCollisions(entity: Entity, entities: Entity[]) {
    const entityMesh = entity.actor.mesh;
    if (entityMesh.geometry instanceof BufferGeometry) {
      return;
    }
    const entitiesMeshes = entities.map(entityEl => entityEl.actor.mesh);
    const originPoint = entityMesh.position.clone();

    const collisionEntitiesIndices = new Set<number>();

    for (let vertexIndex = 0; vertexIndex < entityMesh.geometry.vertices.length; vertexIndex++) {
      const localVertex = entityMesh.geometry.vertices[vertexIndex].clone();
      const globalVertex = localVertex.applyMatrix4(entityMesh.matrix);
      const directionVector = globalVertex.sub(entityMesh.position);

      const ray = new Raycaster(originPoint, directionVector.clone().normalize());
      const collisionResults = ray.intersectObjects(entitiesMeshes);
      collisionResults.forEach((collisionResult) => {
        const collisionEntity = entities.find(entityEl => entityEl.actor.mesh.id === collisionResult.object.id);
        if (!collisionEntity) {
          throw new Error('Entity not found');
        }
        if (!collisionEntitiesIndices.has(collisionEntity.actor.mesh.id)) {
          entity.onCollide(collisionEntity);
          collisionEntity.onCollide(entity);
          collisionEntitiesIndices.add(collisionEntity.actor.mesh.id);
        }
      });
    }
  }
}
