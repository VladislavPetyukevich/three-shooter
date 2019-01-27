import Bullet from './Bullet';

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
    const bullet = new Bullet();
    bullet.position.copy(this.playerControls.getObject().position);
    this.playerscene.add(bullet);
  }
}
