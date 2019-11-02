import { Mesh } from 'three';

export interface Actor {
  mesh: Mesh;
  update: (delta: number) => void;
}
