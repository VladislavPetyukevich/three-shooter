import PointerLockControls from './PointerLockControls';

class PayerControls {
  constructor(camera, cannonBody) {
    this.pointerLockControls = new PointerLockControls(camera, cannonBody);
  }

  getObject = () => this.pointerLockControls.getObject();

  getCamera = () => this.pointerLockControls.getObject().children[0].children[0];

  set enabled(newvalue) {
    this.pointerLockControls.enabled = newvalue;
  }

  get enabled() {
    return this.movementControls.enabled;
  }

  update (delta) {
    this.pointerLockControls.update(delta);
  }
}

export default PayerControls;
