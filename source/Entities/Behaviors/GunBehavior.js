export default class GunBehavior {
  constructor(holderBody, container) {
    this.holderBody = holderBody;
    this.container = container;
    window.addEventListener('mousedown', this.handleShoot);
  }

  handleShoot = () => {
    const bullet = this.container.createEntity(
      'Bullet',
      {
        position: {
          x: this.holderBody.position.x,
          y: this.holderBody.position.y,
          z: this.holderBody.position.z - 2
        }
      }
    );
  }

  update() { }
}
