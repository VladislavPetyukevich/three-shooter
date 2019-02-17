import * as THREE from 'three';
import * as CANNON from 'cannon';
import keyboard from './Keyboard';

const PI_2 = Math.PI / 2;

export default class PointerLockControls {
  constructor(camera, cannonBody) {
    this.enabled = false;
    this.cannonBody = cannonBody;
    const eyeYPos = 2; // eyes are 2 meters above the ground
    this.canJump = false;
    this.jumpVelocity = 20;
    this.velocityFactor = 50;
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = eyeYPos;
    this.yawObject.add(this.pitchObject);
    this.quat = new THREE.Quaternion();
    this.velocity = this.cannonBody.velocity;

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new THREE.Vector3();
    this.euler = new THREE.Euler();

    this.contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new CANNON.Vec3(0, 1, 0);
    this.cannonBody.addEventListener("collide", this.handleCollide);

    document.addEventListener('mousemove', this.handleMouseMove, false);
  }

  handleMouseMove = event => {
    if (this.enabled === false) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;

    this.pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
  }

  handleCollide = event => {
    const contact = event.contact;

    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == this.cannonBody.id)  // bi is the player body, flip the contact normal
      contact.ni.negate(this.contactNormal);
    else
      this.contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    if (this.contactNormal.dot(this.upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
      this.canJump = true;
  }

  getObject() {
    return this.yawObject;
  };

  getCannonBody() {
    return this.cannonBody;
  }

  update(delta) {
    this.inputVelocity.set(0, 0, 0);

    if (keyboard.key[87]) {
      this.inputVelocity.z = -this.velocityFactor * delta;
    }
    if (keyboard.key[83]) {
      this.inputVelocity.z = this.velocityFactor * delta;
    }
    if (keyboard.key[65]) {
      this.inputVelocity.x = -this.velocityFactor * delta;
    }
    if (keyboard.key[68]) {
      this.inputVelocity.x = this.velocityFactor * delta;
    }
    if (this.canJump && keyboard.key[32]) {
      this.velocity.y = this.jumpVelocity;
      this.canJump = false;
    }

    // Convert velocity to world coordinates
    this.euler.x = this.pitchObject.rotation.x;
    this.euler.y = this.yawObject.rotation.y;
    this.euler.order = "XYZ";
    this.quat.setFromEuler(this.euler);
    this.inputVelocity.applyQuaternion(this.quat);

    // Add to the object
    this.velocity.x += this.inputVelocity.x;
    this.velocity.z += this.inputVelocity.z;

    this.yawObject.position.copy(this.cannonBody.position);
  }
};
