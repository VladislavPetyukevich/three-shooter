import {
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  Mesh,
  AmbientLight,
  TextureLoader,
  PointLight,
  Matrix4,
  BoxGeometry,
  MeshPhongMaterial,
  SphereGeometry
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
import loadModel from '../loadModel';
import rustytiles01Texture from '../assets/rustytiles01_diff.jpg';
import rustytiles01NormalMap from '../assets/rustytiles01_norm.jpg';
import rustytiles01BumpMap from '../assets/rustytiles01_spec.jpg';
import testKitchen from '../assets/Kitchen_Cabinet_Base_Full.dae';
import testScreen from '../assets/test1.png';
import EventChannel from '../EventChannel';
import imageDisplayer from '../ImageDisplayer';
import PhysicsBox from '../Physics/PhysicsBox';
import PhysicsBall from '../Physics/PhysicsBall';
import EntitiesContainer, { EVENT_TYPES } from '../Entities/EntitiesContainer';
import Player from '../Entities/Player';
import Enemy from '../Entities/Enemy';

const textureLoader = new TextureLoader();
const testScreenTexture = textureLoader.load(testScreen);

class Scene1 {
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
    EventChannel.addSubscriber(this.enemiesEventsSubscriber);

    this.player = this.entitiesContainer.createEntity(
      'Player',
      { camera: this.camera, position: new Vec3(2, -3, -10) }
    );
    this.scene.add(this.player.behavior.getObject());
    this.playerGun = this.entitiesContainer.createEntity(
      'Gun',
      { holderBody: this.player.actor.solidBody.body }
    );
    // lights
    this.scene.add(new AmbientLight(0x404040, 5));
    this.pointLight = new PointLight(0xffffff, 50, 100);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    const floorGeometry = new PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floormaterial = new MeshPhongMaterial({ color: 'white' });
    const floormesh = new Mesh(floorGeometry, floormaterial);
    floormesh.castShadow = true;
    floormesh.receiveShadow = true;
    this.scene.add(floormesh);

    this.box = new PhysicsBox(
      new BoxGeometry(2, 2, 2),
      new MeshPhongMaterial({
        map: new TextureLoader().load(rustytiles01Texture),
        normalMap: new TextureLoader().load(rustytiles01NormalMap),
        bumpMap: new TextureLoader().load(rustytiles01BumpMap)
      }),
      new Vec3(2, -3, -5)
    );
    this.world.addBody(this.box.body);
    this.scene.add(this.box.mesh);

    this.ball = new PhysicsBall(
      new SphereGeometry(1, 32, 32),
      new MeshPhongMaterial({ color: 'red' }),
      new Vec3(2, -5, -5)
    );
    this.world.addBody(this.ball.body);
    this.scene.add(this.ball.mesh);

    this.spawnEnemies();

    this.testImageId = undefined;

    loadModel(testKitchen).then(model => {
      model.scale.set(6, 6, 6);
      model.position.set(-10, 0, -15);
      this.scene.add(model);
    })
  }

  showTestImage = () => this.testImageId = imageDisplayer.add(testScreenTexture);

  hideTestImage = () => imageDisplayer.remove(this.testImageId)

  spawnEnemies() {
    const angleStep = 45;
    const maxAngle = 360;
    const radius = 100;
    for (let angle = 0; angle < maxAngle; angle += angleStep) {
      const angleRadians = angle * Math.PI / 180;
      const x = Math.cos(angleRadians) * radius;
      const y = Math.sin(angleRadians) * radius;

      this.entitiesContainer.createEntity(
        'Enemy',
        { playerBody: this.player.actor.solidBody.body, position: new Vec3(x, 1.5, y) }
      );
    }
  }

  enemiesEventsSubscriber = (eventType, targetEnemy) => {
    switch (eventType) {
      case EVENT_TYPES.DELETE_ENEMY:
        if (this.enemiesContainer.enemies.length == 0) {
          this.spawnEnemies();
        }
        break;
    }
  }

  update(delta) {
    if (this.player.behavior.getObject().position.z < -10 && !this.testImageId) {
      this.showTestImage();
      setTimeout(this.hideTestImage, 40);
    }
    this.pointLight.position.copy(this.player.actor.solidBody.body.position);
    this.world.step(delta);
    this.box.update();
    this.ball.update();
    this.entitiesContainer.update(delta);
  }
}

export default Scene1;