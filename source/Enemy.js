import { TextureLoader, PlaneGeometry, MeshLambertMaterial, Mesh } from 'three';
import enemyTexture from './assets/enemy.png';

const textureLoader = new TextureLoader();

export default class Enemy {
  constructor(props) {
    this.playerCamera = props.playerCamera;

    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new PlaneGeometry(50, 50, 10, 10);

    const material = new MeshLambertMaterial({
        map: spriteMap,
    });
    material.transparent = true;
    this.enemy = new Mesh(geometry, material);
    this.enemy.receiveShadow = true;
    this.enemy.castShadow = true;
    this.enemy.scale.set(0.2,0.35, 1);
    props.scene.add(this.enemy);
  }

  getObject = () => this.enemy;

  update() {
    this.enemy.rotation.setFromRotationMatrix( this.playerCamera.matrix );
  }
}

