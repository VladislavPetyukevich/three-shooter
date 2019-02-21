import {
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  Mesh,
  AmbientLight,
  TextureLoader,
  PointLight,
  Matrix4,
  MeshLambertMaterial,
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
  Sphere,
  Body,
  Plane,
  Vec3
} from 'cannon';
import loadModel from '../loadModel';
import PlayerControls from '../PayerControls';
import rustytiles01Texture from '../assets/rustytiles01_diff.jpg';
import rustytiles01NormalMap from '../assets/rustytiles01_norm.jpg';
import rustytiles01BumpMap from '../assets/rustytiles01_spec.jpg';
import testKitchen from '../assets/Kitchen_Cabinet_Base_Full.dae';
import testScreen from '../assets/test1.png';
import Enemy from '../Enemy';
import Gun from '../Gun';
import imageDisplayer from '../ImageDisplayer';
import PhysicsBox from '../Physics/PhysicsBox';
import PhysicsBall from '../Physics/PhysicsBall';

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

    // Create a player body sphere
    const mass = 10;
    const radius = 1.3;
    const sphereShape = new Sphere(radius);
    const sphereBody = new Body({ mass: mass });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0, 10, 0);
    sphereBody.linearDamping = 0.9;
    this.world.add(sphereBody);

    var groundShape = new Plane();
    var groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    this.world.add(groundBody);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.controls = new PlayerControls(this.camera, sphereBody);
    this.controls.enabled = true;
    this.scene.add(this.controls.getObject());

    // lights
    this.scene.add(new AmbientLight(0x404040, 0.2));
    this.pointLight = new PointLight(0xffffff, 50, 50);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    this.gun = new Gun({ controls: this.controls, scene: this.scene, world: this.world });

    const floorGeometry = new PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floormaterial = new MeshLambertMaterial({ color: 0xdddddd });
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

    this.enemy = new Enemy({
      scene: this.scene,
      playerCamera: this.controls.getObject()
    });
    this.enemy.getObject().scale.set(0.2, 0.35, 1);
    this.enemy.getObject().position.set(5, 8, -35);

    this.testImageId = undefined;

    loadModel(testKitchen).then(model => {
      model.scale.set(6, 6, 6);
      model.position.set(-10, 0, -15);
      this.scene.add(model);
    })
  }

  showTestImage = () => this.testImageId = imageDisplayer.add(testScreenTexture);

  hideTestImage = () => imageDisplayer.remove(this.testImageId)

  update(delta) {
    if (this.controls.getObject().position.z < -10 && !this.testImageId) {
      this.showTestImage();
      setTimeout(this.hideTestImage, 40);
    }
    this.controls.update(delta);
    this.enemy.update();
    this.pointLight.position.copy(this.controls.getObject().position);
    this.gun.update(delta);
    this.world.step(delta);
    this.box.update();
    this.ball.update();
  }
}

export default Scene1;