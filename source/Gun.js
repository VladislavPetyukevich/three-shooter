export default class Gun {
  constructor(props) {
    this.playerCamera = props.camera;
    this.playerscene = props.scene;

    window.addEventListener('mousedown', () => {
      if (event.which === 1) {
        this.shoot();
      }
    });
  }

  shoot = () => {
    console.log('shoot');
  }
}
