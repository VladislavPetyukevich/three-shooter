import { BasicScene, BasicSceneProps } from '@/core/Scene';
import { BoxGeometry, MeshBasicMaterial, Mesh, Box3 } from 'three';

export class LoadingScene extends BasicScene {
  rotatingCube: Mesh
  texturesProgress: number;
  soundsProgress: number;
  imagesScaleProgress: number;

  constructor(props: BasicSceneProps) {
    super(props);
    this.texturesProgress = 0;
    this.soundsProgress = 0;
    this.imagesScaleProgress = 0;

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.rotatingCube = new Mesh(geometry, material);
    this.rotatingCube.position.setZ(-5);
    this.rotatingCube.position.setX(-4);
    this.scene.add(this.rotatingCube);
  }

  onImagesScaleProgress(progress: number) {
    this.imagesScaleProgress = progress;
    this.updateProgress();
  }

  onTexturesProgress(progress: number) {
    this.texturesProgress = progress;
    this.updateProgress();
  }

  onSoundsProgress(progress: number) {
    this.soundsProgress = progress;
    this.updateProgress();
  }

  updateProgress() {
    const progress = (this.texturesProgress + this.soundsProgress + this.imagesScaleProgress) / 3;
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
