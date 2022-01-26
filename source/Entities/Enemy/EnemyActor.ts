import { Mesh, Color, BoxGeometry, MeshLambertMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Player } from '@/Entities/Player/Player';
import { EnemyTextures } from './Enemy';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';
import { easeInSine } from '@/EaseProgress';
import { EaseColor } from '@/EaseColor';
import { lighter } from '@/constants';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
  color: Color;
  textures: EnemyTextures;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  material: MeshLambertMaterial;
  player: Player;
  spriteSheet: SpriteSheet;
  easeColor: EaseColor;
  isColorEaseActive: boolean;

  constructor(props: ActorProps) {
    const enemyWalk1File = texturesStore.getTexture(props.textures.walk1);
    const enemyWalk2File = texturesStore.getTexture(props.textures.walk2);
    const enemyDeathFile = texturesStore.getTexture(props.textures.death);
    const geometry = new BoxGeometry(1.5, 3, 0.1);
    this.material = new MeshLambertMaterial({
      color: props.color,
    });
    this.material.transparent = true;
    this.spriteSheet = new SpriteSheet({
      textures: [enemyWalk1File, enemyWalk2File, enemyDeathFile],
      material: this.material,
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.renderOrder = 1;
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.player = props.player;
    this.easeColor = new EaseColor({
      originalColor: this.material.color,
      targetColor: this.material.color,
      speed: 1.5,
      transitionFunction: easeInSine,
    });
    this.isColorEaseActive = false;
  }

  lerpColorLighter(factor: number) {
    const targetColor = lighter(this.material.color, factor);
    this.easeColor.currentColor = this.material.color;
    this.easeColor.targetColor = targetColor;
    this.isColorEaseActive = true;
  }

  update(delta: number) {
    const playerMesh = this.player.actor.mesh;
    this.mesh.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
    this.updateColor(delta);
  }

  updateColor(delta: number) {
    if (!this.isColorEaseActive) {
      return;
    }
    this.easeColor.update(delta);
    this.material.color = this.easeColor.getColor();
    if (this.easeColor.checkIsProgressCompelete()) {
      this.isColorEaseActive = false;
    }
  }
}
