import {
  Vector3,
  Mesh,
  Material,
  MeshLambertMaterial,
  BoxGeometry
} from 'three';
import { Actor } from '@/core/Entities/Actor';
import { SinTable } from '@/SinTable';
import { TimeoutsManager } from '@/TimeoutsManager';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { gameTextures } from '@/constantsAssets';

interface GunPickUpActorProps {
  size: Vector3;
  position: Vector3;
  gunTextureName: keyof typeof gameTextures;
}

export class GunPickUpActor implements Actor {
  mesh: Mesh;
  originalYPos: number;
  sinTable: SinTable;
  timeouts: TimeoutsManager<'updateY'>;

  constructor(props: GunPickUpActorProps) {
    this.sinTable = new SinTable({
      step: 1,
      amplitude: 0.1,
    });
    this.timeouts = new TimeoutsManager({
      updateY: 0.001,
    });
    const geometry = new BoxGeometry(props.size.x, props.size.y, props.size.z);
    const material = new MeshLambertMaterial({
      transparent: true,
      map: texturesStore.getTexture(props.gunTextureName),
    });
    const materials: Material[] = [];
    materials[0] = material;
    materials[1] = material;
    materials[4] = material;
    materials[5] = material;
    this.mesh = new Mesh(geometry, materials);
    this.mesh.position.copy(props.position);
    this.originalYPos = this.mesh.position.y;
  }

  update(delta: number) {
    this.mesh.rotateY(-delta * 2);
    if (this.timeouts.checkIsTimeOutExpired('updateY')) {
      this.timeouts.updateExpiredTimeOut('updateY');
      this.mesh.position.y = this.originalYPos + this.sinTable.getNextSinValue();
    }
    this.timeouts.updateTimeOut('updateY', delta);
  }
}
