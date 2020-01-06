import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial } from 'three';
import { Player } from '@/Entities/Player/Player';
import { texturesStore } from '@/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  player: Player;
  spriteSheet: SpriteSheet;

  constructor(props: ActorProps) {
    const enemyWalk1File = texturesStore.getTexture(GAME_TEXTURE_NAME.enemyWalk1);
    const enemyWalk2File = texturesStore.getTexture(GAME_TEXTURE_NAME.enemyWalk2);
    const enemyDeathFile = texturesStore.getTexture(GAME_TEXTURE_NAME.enemyDeath);
    const geometry = new BoxGeometry(1.5, 3, 0.1);
    const material = new MeshPhongMaterial();
    material.transparent = true;
    this.spriteSheet = new SpriteSheet({
      textures: [enemyWalk1File, enemyWalk2File, enemyDeathFile],
      material
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.player = props.player;
  }

  update() {
    const playerMesh = this.player.actor.mesh;
    this.mesh.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
  }
}
