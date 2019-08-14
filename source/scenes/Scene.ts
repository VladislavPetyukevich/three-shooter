import {
  Scene,
  PerspectiveCamera,
  AudioListener
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
import { ENTITY_NAME } from '../constants';
import EntitiesContainer from '../Entities/EntitiesContainer';

export interface BasicSceneProps {
  renderWidth: number;
  renderHeight: number;
};

export default class BasicScene {
  world: World;
  solver: GSSolver;
  scene: Scene;
  camera: PerspectiveCamera;
  audioListener: AudioListener;
  entitiesContainer: EntitiesContainer;
  player: any;

  constructor(props: BasicSceneProps) {
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
    var physicsContactMaterial = new ContactMaterial(physicsMaterial, physicsMaterial);
    // We must add the contact materials to the world
    this.world.addContactMaterial(physicsContactMaterial);

    var groundShape = new Plane();
    var groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);

    this.audioListener = new AudioListener();
    this.camera.add(this.audioListener);

    this.entitiesContainer = new EntitiesContainer(this.scene, this.world);

    this.player = this.entitiesContainer.createEntity(
      ENTITY_NAME.PLAYER,
      { camera: this.camera, position: new Vec3(2, 2, -10) }
    );
    this.scene.add(this.player.behavior.getObject());
  }

  update(delta: number) {
    this.world.step(delta);
    this.entitiesContainer.update(delta);
  }
}
