import { Mesh, Vector3, BoxGeometry, MeshBasicMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { randomNumbers } from '@/RandomNumbers';

const particleCount = 20;

interface ActorProps {
  position: Vector3;
}

interface ParticleData {
  velocity: Vector3;
  mesh: Mesh;
}

export class HitParticlesActor implements Actor {
  mesh: Mesh;
  particleMaterial: MeshBasicMaterial;
  particleData: ParticleData[];
  opacity: number;

  constructor(props: ActorProps) {
    // Create a container mesh
    this.mesh = new Mesh(
      new BoxGeometry(0.1, 0.1, 0.1),
      new MeshBasicMaterial({
        visible: false,
      })
    );
    this.mesh.position.copy(props.position);

    // Create particle material with red color for blood effect
    this.particleMaterial = new MeshBasicMaterial({
      color: 0xFF0000,
      opacity: 1.0,
      transparent: true,
    });

    this.particleData = [];
    this.opacity = 1.0;

    // Create individual particle meshes
    const particleGeometry = new BoxGeometry(0.1, 0.1, 0.1);

    // Initialize particles with random positions and velocities
    for (let i = 0; i < particleCount; i++) {
      const angle = randomNumbers.getRandom() * Math.PI * 2;
      const radius = randomNumbers.getRandom();
      const height = (randomNumbers.getRandom() - 0.5) * 0.5;

      const initialPosition = new Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Calculate velocity based on initial position for outward expansion
      const velocity = new Vector3(
        Math.cos(angle) * 2,
        -3, // Gravity
        Math.sin(angle) * 2
      );

      // Create individual mesh for this particle
      const particleMesh = new Mesh(particleGeometry, this.particleMaterial);
      particleMesh.position.copy(initialPosition);
      this.mesh.add(particleMesh);

      this.particleData.push({
        velocity,
        mesh: particleMesh,
      });
    }
  }

  update(delta: number) {
    // Update each particle mesh
    for (let i = 0; i < particleCount; i++) {
      const data = this.particleData[i];
      
      // Update position based on velocity
      data.mesh.position.x += data.velocity.x * delta;
      data.mesh.position.y += data.velocity.y * delta;
      data.mesh.position.z += data.velocity.z * delta;
    }

    // Fade out particles
    this.opacity -= delta * 3;
    if (this.opacity < 0) {
      this.opacity = 0;
    }
    this.particleMaterial.opacity = this.opacity;
  }
}
