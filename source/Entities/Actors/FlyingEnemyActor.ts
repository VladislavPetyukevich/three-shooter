import { TextureLoader, MeshPhongMaterial, BoxGeometry } from 'three';
import { Body } from 'cannon';
import Actor from '@/core/Entities/Actor';
import PhysicsBox from '@/SolidBody/PhysicsBox';
import TextureAnimator from '@/TextureAnimator';
import enemyTexture from '@/assets/eye.png';

const textureLoader = new TextureLoader();

const WALK_TEXTURE_TILES_HORIZONTAL = 2;
const WALK_TEXTURE_TILES_VERTICAL = 1;

export default class EnemyActor extends Actor {
  playerBody: Body;
  spriteMapAnimator: TextureAnimator;
  constructor(playerBody: Body, position = { x: 0, y: 0, z: 0 }) {
    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(3, 3, 1);
    const mass = 0.1;
    const material = new MeshPhongMaterial({
      map: spriteMap
    });
    material.transparent = true;
    super({
      solidBody: new PhysicsBox(
        geometry,
        [null, null, null, null, material],
        position,
        mass
      )
    });

    this.playerBody = playerBody;
    this.spriteMapAnimator = new TextureAnimator(
      spriteMap,
      WALK_TEXTURE_TILES_HORIZONTAL,
      WALK_TEXTURE_TILES_VERTICAL,
      WALK_TEXTURE_TILES_HORIZONTAL + WALK_TEXTURE_TILES_VERTICAL,
      0.4
    );
    this.solidBody.body!.collisionResponse = true;
    // this.solidBody.body!.isEnemy = true;
    this.solidBody.mesh!.receiveShadow = true;
  }

  update(delta: number) {
    super.update(delta);
    this.spriteMapAnimator.update(delta);
  }
}
