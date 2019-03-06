import { TextureLoader, MeshLambertMaterial, Quaternion, BoxGeometry, Vector3, Euler } from 'three';
import { Vec3 } from 'cannon';
import PhysicsBox from '../Physics/PhysicsBox';
import enemyTexture from '../assets/golem.png';

const textureLoader = new TextureLoader();

export default class Enemy extends PhysicsBox {
  constructor(props) {
    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(3, 3, 1);
    const material = new MeshLambertMaterial({
      map: spriteMap
    });
    material.transparent = true;
    super(
      geometry,
      [null, null, null, null, material],
      props.position
    );
  
    this.playerBody = props.playerBody;
    this.walkSpeed = 10;
    this.body.collisionResponse = true;
    this.body._hp = 1;
    this.body.isEnemy = true;
    this.mesh.receiveShadow = true;
    this.inputVelocity = new Vector3();
    this.euler = new Euler();
    this.quat = new Quaternion();
  }

  update() {
    super.update();
    const direction = new Vec3();
    this.playerBody.position.vsub(this.body.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.body.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.body.velocity);
  }
}
