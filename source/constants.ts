import wallTextureFile from '@/assets/wall.png';
import wallNormalFile from '@/assets/wall-normal.png';
import gunTextureFile from './assets/gun.png';
import gunFireFile from './assets/gunFire.png';
import enemyWalk1 from './assets/enemyWalk1.png';
import enemyWalk2 from './assets/enemyWalk2.png';
import enemyDeath from './assets/enemyDeath.png';
import gunShoot  from './assets/shoot.mp3';
import shootMark1 from './assets/shootMark1.png';
import shootMark2 from './assets/shootMark2.png';

export const PI_180 = Math.PI / 180;

export const PI_2 = Math.PI / 2;

export const enum KEYBOARD_KEY {
  W = 87,
  A = 65,
  S = 83,
  D = 68
};

export const enum ENTITY_TYPE {
  PLAYER = 'PLAYER',
  BULLET = 'BULLET',
  WALL = 'WALL',
  ENEMY = 'ENEMY',
  GUN = 'GUN',
  SHOOT_MARK = 'SHOOT_MARK'
};

export const GUN = {
  BOB_SPEED: 5,
  BOB_DISTANCE: 0.05
};

export const BULLET = {
  LIFE_TIME: 5,
  MASS: 5,
  SHAPE_RADIUS: 0.3,
  COLOR: 'red'
};

export const FLYING_ENEMY = {
  HP: 1,
  FLYING_SPEED: 10,
  SHAKE_SPEED: 5,
  SHAKE_DISTANCE: 5,
  Y_POS: 3
};

export const ENEMY = {
  WALK_SPEED: 2,
  BULLET_SPEED: 25,
  MOVEMENT_TIME_OUT: 3,
  SHOOT_TIME_OUT: 1
};

export const PLAYER = {
  HP: 100,
  WALK_SPEED: 1000,
  BODY_WIDTH: 1.5,
  BODY_HEIGHT: 1.5,
  BODY_DEPTH: 1.5,
  CAMERA_ROTATION_SPEED: Math.PI * 0.5
};

export const enum EVENT_TYPES {
  DELETE_ENTITIY,
  ENEMY_SHOOT
};

export const gameTextures = {
  wallTextureFile,
  wallNormalFile,
  gunTextureFile,
  gunFireFile,
  enemyWalk1,
  enemyWalk2,
  enemyDeath,
  shootMark1,
  shootMark2
};

export const gameSounds = {
  gunShoot
};

export const enum GAME_TEXTURE_NAME {
  wallTextureFile = 'wallTextureFile',
  wallNormalFile = 'wallNormalFile',
  gunTextureFile = 'gunTextureFile',
  gunFireFile = 'gunFireFile',
  enemyWalk1 = 'enemyWalk1',
  enemyWalk2 = 'enemyWalk2',
  enemyDeath = 'enemyDeath',
  shootMark1 = 'shootMark1',
  shootMark2 = 'shootMark2'
};

export const enum GAME_SOUND_NAME {
  gunShoot = 'gunShoot'
};
