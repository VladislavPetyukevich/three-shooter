import { TextureLoader, MeshLambertMaterial, Quaternion, BoxGeometry, Vector3, Euler } from 'three';
import { Vec3 } from 'cannon';
import PhysicsBox from '../Physics/PhysicsBox';
import TextureAnimator from '../TextureAnimator';
import enemyTexture from '../assets/golem-walk.png';

const textureLoader = new TextureLoader();

const WALK_TEXTURE_TILES_HORIZONTAL = 2;
const WALK_TEXTURE_TILES_VERTICAL = 1;

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

    this.spriteMapAnimator = new TextureAnimator(
      spriteMap,
      WALK_TEXTURE_TILES_HORIZONTAL,
      WALK_TEXTURE_TILES_VERTICAL,
      WALK_TEXTURE_TILES_HORIZONTAL + WALK_TEXTURE_TILES_VERTICAL,
      0.3
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

  update(delta) {
    super.update();
    this.spriteMapAnimator.update(delta);
    const direction = new Vec3();
    this.playerBody.position.vsub(this.body.position, direction);
    direction.y = 0;
    direction.normalize();
    const forward = new Vec3(0, 0, 1);
    this.body.quaternion.setFromVectors(forward, direction);
    direction.mult(this.walkSpeed, this.body.velocity);
  }
}
