import { TextureLoader, MeshLambertMaterial, BoxGeometry, Vector3 } from 'three';
import { Vec3 } from 'cannon';
import PhysicsBox from './Physics/PhysicsBox';
import enemyTexture from './assets/golem.png';

const textureLoader = new TextureLoader();

export default class Enemy {
  constructor(props) {
    this.playerBody = props.playerBody;
    this.walkSpeed = 10;

    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(3, 3, 0.1);

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
    const direction = new Vec3();
    this.playerBody.position.vsub(this.enemy.body.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.enemy.body.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.enemy.body.velocity);
    this.enemy.update();
  }
}
