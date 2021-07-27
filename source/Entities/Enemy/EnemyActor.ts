import { Actor } from '@/core/Entities/Actor';
import { Mesh, Color, BoxGeometry, MeshLambertMaterial } from 'three';
import { Player } from '@/Entities/Player/Player';
import { EnemyTextures } from './Enemy';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
  color: Color;
  textures: EnemyTextures;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  player: Player;
  spriteSheet: SpriteSheet;

  constructor(props: ActorProps) {
    const enemyWalk1File = texturesStore.getTexture(props.textures.walk1);
    const enemyWalk2File = texturesStore.getTexture(props.textures.walk2);
    const enemyDeathFile = texturesStore.getTexture(props.textures.death);
    const geometry = new BoxGeometry(1.5, 3, 0.1);
    const material = new MeshLambertMaterial({
      color: props.color,
    });
    material.transparent = true;
    this.spriteSheet = new SpriteSheet({
      textures: [enemyWalk1File, enemyWalk2File, enemyDeathFile],
      material,
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.renderOrder = 1;
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
