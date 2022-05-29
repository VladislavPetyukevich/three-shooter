import { Vector2 } from 'three';

export interface CellCoordinatesProps {
  size: number;
}
export class CellCoordinates {
  size: number;

  constructor(props: CellCoordinatesProps) {
    this.size = props.size;
  }

  toWorldCoordinates(cellCoordinates: Vector2) {
    return new Vector2(
      cellCoordinates.x * this.size,
      cellCoordinates.y * this.size,
    );
  }
}
