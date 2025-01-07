import { Mesh, Color, BoxGeometry, MeshLambertMaterial, MeshBasicMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Player } from '@/Entities/Player/Player';
import { EnemyTextures } from './Enemy';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';
import { easeInSine } from '@/EaseProgress';
import { EaseColor } from '@/EaseColor';

interface ActorProps {
  position: { x: number; y: number; z: number };
  player: Player;
  color: Color;
  textures: EnemyTextures;
}

export class EnemyActor implements Actor {
  mesh: Mesh;
  meshInner: Mesh;
  materialInner: MeshLambertMaterial;
  player: Player;
  spriteSheet: SpriteSheet;
  easeColor: EaseColor;
  isColorEaseActive: boolean;

  constructor(props: ActorProps) {
    const enemyWalk1File = texturesStore.getTexture(props.textures.walk1);
    const enemyWalk2File = texturesStore.getTexture(props.textures.walk2);
    const enemyDeathFile = texturesStore.getTexture(props.textures.death);
    const colliderGeometry = new BoxGeometry(1.5, 3, 1.5);
    const innerGeometry = new BoxGeometry(1.5, 3, 0.1);
    const material = new MeshBasicMaterial({
      visible: false,
    });
    this.materialInner = new MeshLambertMaterial({
      color: props.color,
      transparent: true,
      alphaTest: 0.1,
    });
    this.spriteSheet = new SpriteSheet({
      textures: [enemyWalk1File, enemyWalk2File, enemyDeathFile],
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
    this.easeColor = new EaseColor({
      originalColor: this.materialInner.color,
      targetColor: this.materialInner.color,
      speed: 1.5,
      transitionFunction: easeInSine,
    });
    this.isColorEaseActive = false;
  }

  update(delta: number) {
    const playerMesh = this.player.mesh;
    this.meshInner.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
    this.updateColor(delta);
  }

  updateColor(delta: number) {
    if (!this.isColorEaseActive) {
      return;
    }
    this.easeColor.update(delta);
    this.materialInner.color = this.easeColor.getColor();
    if (this.easeColor.checkIsProgressCompelete()) {
      this.isColorEaseActive = false;
    }
  }
}
