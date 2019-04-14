export default class GunBehavior {
  constructor(actor, holderBody, container) {
    this.actor = actor;
    this.holderBody = holderBody;
    this.container = container;
    window.addEventListener('mousedown', this.handleShoot);
  }

  handleShoot = () => {
    console.log('gun shoot');
  }

  update() { }
}
