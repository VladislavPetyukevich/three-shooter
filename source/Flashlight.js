import {
  Mesh,
  CylinderGeometry,
  MeshPhongMaterial,
  SpotLight
} from 'three';

const POWER = 3000;

export default class Flashlight {
  constructor(props) {
    this.camera = props.camera;
    this.flashLight = new Mesh(new CylinderGeometry(1, 1, 7, 20), new MeshPhongMaterial({ color: 0x000000 }));
    this.flashLight.rotateX(Math.PI / 2);
    this.camera.add(this.flashLight);

    this.spotLight = new SpotLight(0xffffff, 0.5, 150);
    this.swithLight();
    this.spotLight.angle = 0.7;
    this.spotLight.decay = 2;
    this.spotLight.penumbra = 0.1;
    this.spotLight.distance = 200;
    this.spotLight.castShadow = true;
    this.spotLight.rotateX(Math.PI / 2);
    this.flashLight.add(this.spotLight);
    this.flashLight.add(this.spotLight.target);

    window.addEventListener('mousedown', () => {
      if (event.which === 3) {
        this.swithLight();
      }
    });
  }

  swithLight = () => {
    this.spotLight.power = (this.spotLight.power === POWER) ? 0 : POWER;
  };

  update() {
    this.flashLight.position.copy(this.camera.position);
    this.flashLight.position.x += 2;
    this.flashLight.position.y -= 3;
    this.flashLight.position.z -= 1;
  }
}
