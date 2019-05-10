import {
  Scene,
  PerspectiveCamera
} from 'three';
import {
  World,
  GSSolver,
  SplitSolver,
  NaiveBroadphase,
  Material,
  ContactMaterial,
  Body,
  Plane,
  Vec3
} from 'cannon';
import EntitiesContainer from '../Entities/EntitiesContainer';

export default class BasicScene {
  constructor(props) {
    this.world = new World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;
    this.solver = new GSSolver();

    this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;

    this.solver.iterations = 7;
    this.solver.tolerance = 0.1;
    this.world.solver = new SplitSolver(this.solver);
    this.world.gravity.set(0, -20, 0);
    this.world.broadphase = new NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    var physicsMaterial = new Material("slipperyMaterial");
    var physicsContactMaterial = new ContactMaterial(physicsMaterial,
      physicsMaterial,
      0.0, // friction coefficient
      0.3  // restitution
    );
    // We must add the contact materials to the world
    this.world.addContactMaterial(physicsContactMaterial);

    var groundShape = new Plane();
    var groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    this.world.add(groundBody);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);

    this.entitiesContainer = new EntitiesContainer(this.scene, this.world);
    // EventChannel.addSubscriber(this.enemiesEventsSubscriber);

    this.player = this.entitiesContainer.createEntity(
      'Player',
      { camera: this.camera, position: new Vec3(2, -3, -10) }
    );
    this.scene.add(this.player.behavior.getObject());
    this.playerGun = this.entitiesContainer.createEntity(
      'Gun',
      { holderBody: this.player.actor.solidBody.body }
    );
  }

  update(delta) {
    this.world.step(delta);
    this.entitiesContainer.update(delta);
  }
}
