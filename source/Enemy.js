import { TextureLoader, MeshLambertMaterial, Mesh, BoxGeometry } from 'three';
import enemyTexture from './assets/golem.png';

const textureLoader = new TextureLoader();

export default class Enemy {
  constructor(props) {
    this.playerCamera = props.playerCamera;

    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(1, 1, 1);

    const material = new MeshLambertMaterial({
      map: spriteMap,
    });
    material.transparent = true;
    this.enemy = new Mesh(geometry, [null, null, null, null, material]);
    this.enemy.receiveShadow = true;
    props.scene.add(this.enemy);
  }

  getObject = () => this.enemy;

  update() {
    this.enemy.rotation.setFromRotationMatrix(this.playerCamera.matrix);
  }
}
