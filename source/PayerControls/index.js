import PointerLockControls from './PointerLockControls';
import MovementControls from './MovementControls';

class PayerControls {
  constructor(camera) {
    this.pointerLockControls = new PointerLockControls(camera);
    this.movementControls = new MovementControls(this.pointerLockControls.getObject());
  }

  // work with pointerLockControls
  getObject = () => this.pointerLockControls.getObject();
  getDirection = () => this.pointerLockControls.getDirection();

  getCamera = () => this.pointerLockControls.getObject().children[0].children[0];

  set enabled(newvalue) {
    this.pointerLockControls.enabled = newvalue;
    this.movementControls.enabled = newvalue;
  }

  get enabled() {
    return this.movementControls.enabled;
  }

  update (delta) {
    this.movementControls.update(delta);
  }
}

export default PayerControls;
