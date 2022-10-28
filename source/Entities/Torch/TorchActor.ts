import { Mesh, BoxGeometry, MeshBasicMaterial, PointLight, Color } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Player } from '@/Entities/Player/Player';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';

interface ActorProps {
  position: { x: number; y: number; z: number };
  color: Color;
  player: Player;
}

export class TorchActor implements Actor {
  mesh: Mesh;
  player: Player;
  spriteSheet: SpriteSheet;

  constructor(props: ActorProps) {
    const torchFile = texturesStore.getTexture('torch');
    const torchFire1File = texturesStore.getTexture('torchFire1');
    const torchFire2File = texturesStore.getTexture('torchFire2');
    const geometry = new BoxGeometry(1.5, 1.5, 0.001);
    const material = new MeshBasicMaterial();
    material.transparent = true;
    this.spriteSheet = new SpriteSheet({
      textures: [torchFile, torchFire1File, torchFire2File],
      material
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
    const playerMesh = this.player.mesh;
    this.mesh.rotation.y = Math.atan2(
      (playerMesh.position.x - this.mesh.position.x), (playerMesh.position.z - this.mesh.position.z)
    );
  }
}

