import { TextureLoader, MeshLambertMaterial, BoxGeometry, Vector3 } from 'three';
import PhysicsBox from './Physics/PhysicsBox';
import enemyTexture from './assets/golem.png';

const textureLoader = new TextureLoader();

export default class Enemy {
  constructor(props) {
    this.playerCamera = props.playerCamera;

    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(1, 1, 1);

    const material = new MeshLambertMaterial({
      map: spriteMap
    });
    material.transparent = true;
    this.enemy = new PhysicsBox(
      geometry,
      [null, null, null, null, material],
      props.position
    );
    this.enemy.mesh.receiveShadow = true;
  }

  getObject = () => this.enemy;

  update() {
    this.enemy.update();
    this.enemy.body.quaternion.setFromAxisAngle(
      new Vector3(0, 1, 0),
      this.playerCamera.rotation.y
    )
  }
}
