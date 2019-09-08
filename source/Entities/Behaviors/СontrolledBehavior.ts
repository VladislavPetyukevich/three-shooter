import { Vector3, Object3D, Quaternion, Euler, Ray, Camera } from 'three';
import { Vec3, ICollisionEvent } from 'cannon';
import keyboard from '@/PayerControls/Keyboard';
import { PLAYER } from '@/constants';
import Actor from '@/Entities/Actors/Actor';
import Behavior from './Behavior';
import EntitiesContainer from '@/Entities/EntitiesContainer';
import Gun from '@/Entities/Gun';

const PI_2 = Math.PI / 2;

function getShootDir(camera: Camera) {
  const shootDirection = new Vector3();
  const vector = shootDirection;
  shootDirection.set(0, 0, 1);
  vector.unproject(camera);
  const ray = new Ray(camera.position, vector.sub(camera.position).normalize());
  shootDirection.copy(ray.direction);
  return shootDirection;
}

export default class СontrolledBehavior implements Behavior {
  actor: Actor;
  walkSpeed: number;
  camera: Camera;
  canJump: boolean;
  isRunning: boolean;
  gun: Gun;
  pitchObject: Object3D;
  yawObject: Object3D;
  quat: Quaternion;
  inputVelocity: Vector3;
  euler: Euler;
  contactNormal: Vec3;
  upAxis: Vec3;

  constructor(actor: Actor, walkSpeed: number, camera: Camera, container: EntitiesContainer) {
    this.actor = actor;
    this.walkSpeed = walkSpeed;
    this.camera = camera;
    this.canJump = true;
    this.isRunning = false;

    this.gun = <Gun>container.createEntity(
      Gun,
      { holderBody: this.actor.solidBody.body, holderBehavior: this, camera: camera }
    );
    camera.add(this.gun.actor.solidBody.mesh!);

    this.pitchObject = new Object3D();
    this.pitchObject.add(camera);
    this.yawObject = new Object3D();
    this.yawObject.add(this.pitchObject);
    this.quat = new Quaternion();

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new Vector3();
    this.euler = new Euler();

    this.contactNormal = new Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new Vec3(0, 1, 0);
    this.actor.solidBody.body!.addEventListener("collide", this.handleCollide);

    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('click', this.handleShoot, false);
  }

  handleMouseMove = (event: MouseEvent) => {
    // if (this.enabled === false) return;

    var movementX = event.movementX;
    var movementY = event.movementY;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;

    this.pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
  }

  handleShoot = () => {
    const shootDirection = getShootDir(this.getCamera());
    this.gun.shoot(shootDirection);
  };

  handleCollide = (event: ICollisionEvent) => {
    const contact = event.contact;

    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == this.actor.solidBody.body!.id)  // bi is the player body, flip the contact normal
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

  getCamera = (): Camera => <Camera>this.getObject().children[0].children[0];

  update(delta: number) {
    let isRunning = false;
    this.inputVelocity.set(0, 0, 0);

    if (keyboard.key[87]) {
      isRunning = true;
      this.inputVelocity.z = -this.walkSpeed * delta;
    }
    if (keyboard.key[83]) {
      isRunning = true;
      this.inputVelocity.z = this.walkSpeed * delta;
    }
    if (keyboard.key[65]) {
      isRunning = true;
      this.inputVelocity.x = -this.walkSpeed * delta;
    }
    if (keyboard.key[68]) {
      isRunning = true;
      this.inputVelocity.x = this.walkSpeed * delta;
    }
    if (this.canJump && keyboard.key[32]) {
      this.actor.solidBody.body!.velocity.y = PLAYER.JUMP_VELOCITY;
      this.canJump = false;
    }
    this.isRunning = isRunning;

    // Convert velocity to world coordinates
    this.euler.x = this.pitchObject.rotation.x;
    this.euler.y = this.yawObject.rotation.y;
    this.euler.order = "XYZ";
    this.quat.setFromEuler(this.euler);
    this.inputVelocity.applyQuaternion(this.quat);

    // Add to the object
    this.actor.solidBody.body!.velocity.x += this.inputVelocity.x;
    this.actor.solidBody.body!.velocity.z += this.inputVelocity.z;

    this.yawObject.position.copy(
      new Vector3(
        this.actor.solidBody.body!.position.x,
        this.actor.solidBody.body!.position.y,
        this.actor.solidBody.body!.position.z
      )
    );
  }
}
