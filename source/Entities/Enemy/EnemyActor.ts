import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial } from 'three';
import { Player } from '@/Entities/Player/Player';
import { texturesStore } from '@/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  player: Player;

  constructor(props: ActorProps) {
    const texture = texturesStore.getTexture(GAME_TEXTURE_NAME.enemyTextureFile);
    const geometry = new BoxGeometry(1.5, 3, 0.1);
    const material = new MeshPhongMaterial({ map: texture });
    material.transparent = true;
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.player = props.player;
  }

  update(delta: number) {
    const playerMesh = this.player.actor.mesh;
    this.mesh.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
  }
}
