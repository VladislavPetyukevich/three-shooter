import { TextureLoader, MeshLambertMaterial, BoxGeometry } from 'three';
import Actor from './Actor';
import PhysicsBox from '../../Physics/PhysicsBox';
import TextureAnimator from '../../TextureAnimator';
import enemyTexture from '../../assets/golem-walk.png';

const textureLoader = new TextureLoader();

const WALK_TEXTURE_TILES_HORIZONTAL = 2;
const WALK_TEXTURE_TILES_VERTICAL = 1;
const WALK_SPEED = 10;

export default class EnemyActor extends Actor {
  constructor(playerBody, position = { x: 0, y: 0, z: 0 }) {
    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(3, 3, 1);
    const material = new MeshLambertMaterial({
      map: spriteMap
    });
    material.transparent = true;
    super({
      hp: 1,
      solidBody: new PhysicsBox(
        geometry,
        [null, null, null, null, material],
        position
      ),
      walkSpeed: WALK_SPEED
    });

    this.playerBody = playerBody;
    this.spriteMapAnimator = new TextureAnimator(
      spriteMap,
      WALK_TEXTURE_TILES_HORIZONTAL,
      WALK_TEXTURE_TILES_VERTICAL,
      WALK_TEXTURE_TILES_HORIZONTAL + WALK_TEXTURE_TILES_VERTICAL,
      0.3
    );
    this.solidBody.body.collisionResponse = true;
    this.solidBody.body.isEnemy = true;
    this.solidBody.mesh.receiveShadow = true;
  }

  update(delta) {
    super.update(delta);
    this.spriteMapAnimator.update(delta);
  }
}