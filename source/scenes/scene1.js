import { 
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  PlaneGeometry,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  TextureLoader
} from 'three';
import loadModel from '../loadModel';
import PlayerControls from '../PayerControls';
import rustytiles01Texture from '../assets/rustytiles01_diff.jpg';
import rustytiles01NormalMap from '../assets/rustytiles01_norm.jpg';
import rustytiles01BumpMap from '../assets/rustytiles01_spec.jpg';
import testKitchen from '../assets/Kitchen_Cabinet_Base_Full.dae';
import Enemy from '../Enemy';
import Flashlight from '../Flashlight';

class Scene1 {
  constructor(props) {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.controls = new PlayerControls(this.camera);
    this.controls.enabled = true;
    this.scene.add(this.controls.getObject());

    // lights
    this.scene.add(new AmbientLight(0x404040, 0.03));

    this.flashLight = new Flashlight({ camera: this.camera });

    this.cube = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshPhongMaterial({ color: 'blue' })
    );
    this.cube.position.set(-20, 1.8, -5);
    this.cube.receiveShadow = true;
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    this.testWall = new Mesh(
      new BoxGeometry(20, 20, 20),
      new MeshPhongMaterial({
        map: new TextureLoader().load(rustytiles01Texture),
        normalMap: new TextureLoader().load(rustytiles01NormalMap),
        bumpMap: new TextureLoader().load(rustytiles01BumpMap)
      })
    );
    this.testWall.position.set(20, 10, -20);
    this.testWall.receiveShadow = true;
    this.testWall.castShadow = true;
    this.scene.add(this.testWall);

    this.floor = new Mesh(
      new PlaneGeometry(100, 100),
      new MeshPhongMaterial({ color: 'white' })
    );
    this.floor.receiveShadow = true;
    this.floor.rotation.x -= Math.PI / 2;
    this.scene.add(this.floor);

    this.enemy = new Enemy({
      scene: this.scene,
      playerCamera: this.controls.getObject()
    });
    this.enemy.getObject().scale.set(0.2,0.35, 1);
    this.enemy.getObject().position.set(5, 8, -35);

    loadModel(testKitchen).then(model => {
      model.scale.set(6,6,6);
      model.position.set(-10, 0, -15);
      this.scene.add(model);
    })
  }

  update(delta) {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.02;
    this.controls.update(delta);
    this.enemy.update();
    this.flashLight.update();
  }
}

export default Scene1;