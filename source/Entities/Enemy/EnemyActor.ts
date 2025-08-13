import { Mesh, BoxGeometry, MeshLambertMaterial, MeshBasicMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Player } from '@/Entities/Player/Player';
import { EnemyTextures } from './Enemy';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
  textures: EnemyTextures;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  meshInner: Mesh;
  materialInner: MeshLambertMaterial;
  player: Player;
  spriteSheet: SpriteSheet;
  isColorEaseActive: boolean;

  constructor(props: ActorProps) {
    const enemyWalk1File = texturesStore.getTexture(props.textures.walk1);
    const enemyWalk2File = texturesStore.getTexture(props.textures.walk2);
    const enemyWalk3File = texturesStore.getTexture(props.textures.walk3);
    const enemyWalk4File = texturesStore.getTexture(props.textures.walk4);
    const enemyDeathFile = texturesStore.getTexture(props.textures.death);
    const colliderGeometry = new BoxGeometry(3, 3, 3);
    const innerGeometry = new BoxGeometry(3, 3, 0.1);
    const material = new MeshBasicMaterial({
      visible: false,
    });
    this.materialInner = new MeshLambertMaterial({
      transparent: true,
      alphaTest: 0.1,
    });
    this.spriteSheet = new SpriteSheet({
      textures: [enemyWalk1File, enemyWalk2File, enemyWalk3File, enemyWalk4File, enemyDeathFile],
      material: this.materialInner,
    });
    this.meshInner = new Mesh(innerGeometry, this.materialInner);
    this.mesh = new Mesh(colliderGeometry, material);
    this.mesh.renderOrder = 1;
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.mesh.add(this.meshInner);
    this.player = props.player;
    this.isColorEaseActive = false;
  }

  update() {
    const playerMesh = this.player.mesh;
    this.meshInner.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
  }
}
