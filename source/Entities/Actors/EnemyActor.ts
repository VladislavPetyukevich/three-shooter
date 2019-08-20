import { TextureLoader, Material, MeshPhongMaterial, BoxGeometry } from 'three';
import { Body } from 'cannon';
import Actor from './Actor';
import PhysicsBox from '../../SolidBody/PhysicsBox';
import TextureAnimator from '../../TextureAnimator';
import enemyTexture from '../../assets/enemy.png';

const textureLoader = new TextureLoader();

const WALK_TEXTURE_TILES_HORIZONTAL = 2;
const WALK_TEXTURE_TILES_VERTICAL = 1;

export default class EnemyActor extends Actor {
  playerBody: Body;
  spriteMapAnimator: TextureAnimator;

  constructor(playerBody: Body, position = { x: 0, y: 0, z: 0 }) {
    const spriteMap = textureLoader.load(enemyTexture);
    const geometry = new BoxGeometry(2, 4, 1);
    const emptyMaterial = new Material();
    const material = new MeshPhongMaterial({
      map: spriteMap
    });
    material.transparent = true;
    super({
      solidBody: new PhysicsBox(
        geometry,
        [emptyMaterial, emptyMaterial, emptyMaterial, emptyMaterial, material],
        position
      )
    });

    this.playerBody = playerBody;
    this.spriteMapAnimator = new TextureAnimator(
      spriteMap,
      WALK_TEXTURE_TILES_HORIZONTAL,
      WALK_TEXTURE_TILES_VERTICAL,
      WALK_TEXTURE_TILES_HORIZONTAL + WALK_TEXTURE_TILES_VERTICAL,
      0.3
    );
    this.solidBody!.body!.collisionResponse = true;
    // this.solidBody!.body!.isEnemy = true;
    this.solidBody!.mesh!.receiveShadow = true;
  }

  update(delta: number) {
    super.update();
    this.spriteMapAnimator.update(delta);
  }
}
