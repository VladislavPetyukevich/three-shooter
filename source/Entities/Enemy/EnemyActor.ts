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
  currentTitleX: number;
  currentTitleDisplayTime: number;

  constructor(props: ActorProps) {
    const spriteSheetFile = texturesStore.getTexture(GAME_TEXTURE_NAME.enemySpriteSheetFile);
    this.spriteSheet = new SpriteSheet({
      texture: spriteSheetFile,
      spritesHorizontal: 2,
      spritesVertical: 2
    });
    this.currentTitleX = 0;
    this.currentTitleDisplayTime = 0;
    const texture = this.spriteSheet.getTexture();
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

  updateWalkSprite(delta: number) {
    this.currentTitleDisplayTime += delta;
    if (this.currentTitleDisplayTime < 0.6) {
      return;
    }
    this.currentTitleX = this.currentTitleX ? 0 : 1;
    this.spriteSheet.displaySprite(this.currentTitleX, 0);
    this.currentTitleDisplayTime = 0;
  }

  update(delta: number) {
    const playerMesh = this.player.actor.mesh;
    this.mesh.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
    this.updateWalkSprite(delta);
  }
}
