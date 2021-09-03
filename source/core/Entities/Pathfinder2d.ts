import { Vector2 } from 'three';
import { EntitiesContainer } from './EntitiesContainer';

interface CellNode {
  parent?: CellNode;
  position: CellPosition;
  g: number;
  h: number;
  f: number;
}

interface CellPosition {
  x: number;
  y: number;
}

interface Pathfinder2dProps {
  entitiesContainer: EntitiesContainer;
}

export class Pathfinder2d {
  entitiesContainer: EntitiesContainer;
  nodes: Map<string, CellNode>;

  constructor(props: Pathfinder2dProps) {
    this.entitiesContainer = props.entitiesContainer;
    this.nodes = new Map();
  }

  getPathBetweenEntities(startMeshId: number, endMeshId: number) {
    const collideChecker = this.entitiesContainer.collideChecker;
    const startCellCoordinates = collideChecker.getMeshCoordinates(startMeshId);
    if (!startCellCoordinates) {
      return;
    }
    const endCellCoordinates = collideChecker.getMeshCoordinates(endMeshId);
    if (!endCellCoordinates) {
      return;
    }
    return this.getPathBetweenCells(startCellCoordinates[0], endCellCoordinates[0]);
  }

  getPathBetweenCells(start: CellPosition, end: CellPosition) {
    const startCell = this.entitiesContainer.collideChecker.map[start.x][start.y].entities;
    if (startCell.entries.length > 1) {
      return;
    }
    const endCell = this.entitiesContainer.collideChecker.map[end.x][end.y].entities;
    if (endCell.entries.length > 1) {
      return;
    }
    const open = new Set<CellNode>();
    const closed = new Set<CellNode>();
    const startNode = this.createNode(start);
    const endNode = this.createNode(end);
    open.add(startNode);
    let safeCounter = 300;
    while (open.size > 0) {
      if (!safeCounter--) {
        console.warn('pathfinder safeCounter limit!');
        break;
      }
      let currentNode: CellNode = open.values().next().value;
      open.forEach(oNode => {
        if (
          (oNode.f <= currentNode.f) &&
          (oNode.h < currentNode.h)
        ) {
          currentNode = oNode;
        }
      });

      open.delete(currentNode);
      closed.add(currentNode);

      if (currentNode.position.x === endNode.position.x && currentNode.position.y === currentNode.position.y) {
        return this.restorePath(currentNode);
      }
      for (let neighbour of this.getNeighboringCells(currentNode.position)) {
        if (!this.checkIsCellWalkable(neighbour)) {
          continue;
        }
        const neighbourNode = this.getNode(neighbour);
        if (closed.has(neighbourNode)) {
          continue;
        }
        const distanceToCurrentNode = this.getDistanceBetweenCells(
          currentNode.position,
          neighbour
        );
        const newCostToNeighbour = currentNode.g + distanceToCurrentNode;
        if (
          (newCostToNeighbour < neighbourNode.g) ||
          (!open.has(neighbourNode))
        ) {
          neighbourNode.g = newCostToNeighbour;
          neighbourNode.h = this.getDistanceBetweenCells(
            neighbour,
            end
          );
          neighbourNode.parent = currentNode;
          if (!open.has(neighbourNode)) {
            open.add(neighbourNode);
          }
        }
      }
    }
  }

  getNeighboringCells(position: CellPosition): CellPosition[] {
    return [
      { x: position.x, y: position.y + 1 },
      { x: position.x - 1, y: position.y },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y - 1 },
    ];
  }

  checkIsCellWalkable(position: CellPosition) {
    const collideChecker = this.entitiesContainer.collideChecker;
    const cellX = collideChecker.map[position.x];
    if (!cellX) {
      return true;
    }
    const cellXY = collideChecker.map[position.x][position.y];
    if (!cellXY) {
      return true;
    }
    return cellXY.entities.length === 0;
  }

  getNode(position: CellPosition) {
    return this.nodes.get(this.getPositionHash(position)) || this.createNode(position);
  }

  createNode(position: CellPosition) {
    const node: CellNode = {
      position: position,
      g: 0,
      h: 0,
      f: 0,
    };
    this.insertNodeToMap(node);
    return node;
  }

  insertNodeToMap(node: CellNode) {
    this.nodes.set(
      this.getPositionHash(node.position),
      node
    );
  }

  getPositionHash(position: CellPosition) {
    return '' + position.x + position.y;
  }

  getDistanceBetweenCells(start: CellPosition, end: CellPosition) {
    const dstX = Math.abs(start.x - end.x);
    const dstY = Math.abs(start.y - end.y);
    if (dstX > dstY) {
      return 14 * dstY + 10 * (dstX - dstY);
    }
    return 14 * dstX + 10 * (dstY - dstX);
  }

  restorePath(node: CellNode) {
    const path: Vector2[] = [];
    const collideChecker = this.entitiesContainer.collideChecker;
    let currentNode = node;
    while (currentNode.parent) {
      const position = new Vector2(
        collideChecker.getCellOriginalCoordinate(currentNode.position.x),
        collideChecker.getCellOriginalCoordinate(currentNode.position.y)
      );
      path.unshift(position);
      currentNode = currentNode.parent;
    }
    path.unshift(new Vector2(
      collideChecker.getCellOriginalCoordinate(currentNode.position.x),
      collideChecker.getCellOriginalCoordinate(currentNode.position.y)
    ));
    return path;
  }
}

