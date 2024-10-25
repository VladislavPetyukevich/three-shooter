import { BufferGeometry, LineBasicMaterial, Mesh, Vector3, Line, Color, Float32BufferAttribute, PointsMaterial, Points, BoxGeometry, MeshBasicMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { randomNumbers } from '@/RandomNumbers';
import { PLAYER } from '@/constants';

interface ActorProps {
  startPos: Vector3;
  endPos: Vector3;
  rotationY: number;
}

const particlesPath = [
  new Vector3(0.0, 0.5, 0.0),
  new Vector3(0.0, 1.5, 150.0),
];
const precomputedVertices: number[] = [];
const particlesPathLength = Math.abs(particlesPath[0].distanceTo(particlesPath[1]));
const d = particlesPath[1].clone().sub(particlesPath[0]);
const r = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);

for (let i = PLAYER.BODY_DEPTH; i < particlesPathLength; i += 1.0) {
  const xx = d.x * (i / r);
  const yy = d.y * (i / r);
  const zz = d.z * (i / r);
  const point = new Vector3(particlesPath[0].x + xx, particlesPath[0].y + yy, particlesPath[0].z + zz);

  precomputedVertices.push(
    point.x + (randomNumbers.getRandom() / 4 - 0.125),
    point.y,
    point.z,
  );
}

export class ShootTraceActor implements Actor {
  material: LineBasicMaterial;
  mesh: Mesh;
  particles: Points;
  line: Line;
  meshForParticles: Mesh;

  constructor(props: ActorProps) {
    this.material = new LineBasicMaterial({
      color: randomNumbers.getRandom() > 0.5 ? 0xFF0000 : 0xFFFFFF,
    });
    const points = [
      props.startPos,
      props.endPos,
    ];
    const geometry = new BufferGeometry().setFromPoints(points);
    this.line = new Line(geometry, this.material);
    this.mesh = new Mesh();
    this.mesh.add(this.line);

    this.meshForParticles = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({
        visible: false,
      }),
    );
    this.meshForParticles.position.copy(props.startPos);
    this.meshForParticles.rotation.y = props.rotationY;

    const pointsGeometry = new BufferGeometry();

    const traceLength = Math.trunc(Math.abs(points[0].distanceTo(points[1]))) * 3;
    const particlePathLen = Math.min(traceLength, precomputedVertices.length);
    const particleVertices = new Array(particlePathLen);
    for (let i = 0; i < particlePathLen; i++) {
      particleVertices[i] = precomputedVertices[i];
    }
    pointsGeometry.setAttribute('position', new Float32BufferAttribute(particleVertices, 3));
    const pointsMaterial = new PointsMaterial({
      size: 0.1,
      color: 0xFFFFFF,
      opacity: 0.8,
      alphaTest: 0.5,
      transparent: true,
    });

    this.particles = new Points(pointsGeometry, pointsMaterial);
    this.meshForParticles.add(this.particles);
    this.mesh.add(this.meshForParticles)
  }

  update(delta: number) {
    this.particles.geometry.translate(0, delta * 2.5, 0);
  }
}

