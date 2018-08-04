import { Scene, PerspectiveCamera, BoxGeometry, PlaneGeometry, MeshPhongMaterial, PointLight, Mesh, AmbientLight, TextureLoader } from 'three';
import PlayerControls from '../PayerControls';
import rustytiles01Texture from '../assets/rustytiles01_diff.jpg';
import rustytiles01NormalMap from '../assets/rustytiles01_norm.jpg';
import rustytiles01BumpMap from '../assets/rustytiles01_spec.jpg';

class Scene1 {
  constructor(props) {
    this.scene = new Scene();
    this.scene.add(new AmbientLight(0x404040, 0.2));

    this.pointLight = new PointLight(0xffffff, 0.8, 50);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.controls = new PlayerControls(this.camera);
    this.controls.enabled = true;
    this.scene.add(this.controls.getObject());

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
  }

  update(delta) {
    let camera = this.controls.getObject();
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.02;
    this.controls.update(delta);
    this.pointLight.position.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
  }
}

export default Scene1;