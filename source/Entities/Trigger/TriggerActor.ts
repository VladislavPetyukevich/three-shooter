import { Vector3, Color } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Mesh, MeshLambertMaterial, CylinderGeometry } from 'three';
import { SinTable } from '@/SinTable';
import { TimeoutsManager } from '@/TimeoutsManager';

interface TriggerActorProps {
  size: Vector3;
  position: Vector3;
  color: Color;
}

export class TriggerActor implements Actor {
  mesh: Mesh;
  rotationSpeed: number;
  originalYPos: number;
  sinTable: SinTable;
  timeouts: TimeoutsManager<'updateY'>;

  constructor(props: TriggerActorProps) {
    this.sinTable = new SinTable({
      step: 1,
      amplitude: 0.4,
    });
    this.timeouts = new TimeoutsManager({
      updateY: 0.01,
    });
    this.rotationSpeed = 1.3;
    const geometry = new CylinderGeometry(0, props.size.x, props.size.y, 3);
    const material = new MeshLambertMaterial({ transparent: true, opacity: 0.6, color: props.color });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.copy(props.position);
    this.originalYPos = this.mesh.position.y;
  }
 
  update(delta: number) {
    this.mesh.rotateY(-delta * this.rotationSpeed);
    if (this.timeouts.checkIsTimeOutExpired('updateY')) {
      this.timeouts.updateExpiredTimeOut('updateY');
      this.mesh.position.y = this.originalYPos + this.sinTable.getNextSinValue();
    }
    this.timeouts.updateTimeOut('updateY', delta);
  }
}

