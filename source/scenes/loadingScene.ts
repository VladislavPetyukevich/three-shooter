import { BasicScene, BasicSceneProps } from '@/core/Scene';
import { BoxGeometry, MeshBasicMaterial, Mesh, Box3 } from 'three';

export class LoadingScene extends BasicScene {
  rotatingCube: Mesh

  constructor(props: BasicSceneProps) {
    super(props);

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.rotatingCube = new Mesh(geometry, material);
    this.rotatingCube.position.setZ(-5);
    this.rotatingCube.position.setX(-4);
    this.scene.add(this.rotatingCube);
  }

  onProgress(progress: number) {
    const oldMinX = new Box3().setFromObject(this.rotatingCube).min.x;
    this.rotatingCube.scale.set(1 + progress * 8 / 100, 1, 1);
    const newMinX = new Box3().setFromObject(this.rotatingCube).min.x;
    const xDiff = newMinX - oldMinX;
    this.rotatingCube.position.set(
      this.rotatingCube.position.x - xDiff,
      this.rotatingCube.position.y,
      this.rotatingCube.position.z
    );
  }
}
