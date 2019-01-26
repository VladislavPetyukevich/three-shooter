import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export default class Gun {
  constructor(props) {
    this.playerControls = props.controls;
    this.playerscene = props.scene;

    window.addEventListener('mousedown', () => {
      if (event.which === 1) {
        this.shoot();
      }
    });
  }

  shoot = () => {
    const bullet = new Mesh(
      new SphereGeometry(0.2, 8, 8),
      new MeshBasicMaterial({ color: 'red' })
    );
    bullet.position.copy(this.playerControls.getObject().position);
    this.playerscene.add(bullet);
  }
}
