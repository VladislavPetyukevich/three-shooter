import wallTextureFile from '@/assets/wall.png';
import wallNormalFile from '@/assets/wall-normal.png';
import doorTextureFile from '@/assets/door.png';
import doorNormalFile from '@/assets/door-normal.png';
import floorTextureFile from '@/assets/floor.png';
import gunTextureFile from './assets/gun.png';
import gunFireFile from './assets/gunFire.png';
import enemyWalk1 from './assets/enemyWalk1.png';
import enemyWalk2 from './assets/enemyWalk2.png';
import enemyDeath from './assets/enemyDeath.png';
import gunShoot from './assets/shoot.mp3';
import shootMark1 from './assets/shootMark1.png';
import shootMark2 from './assets/shootMark2.png';
import torch from './assets/torch.png';
import torchFire1 from './assets/torch1.png';
import torchFire2 from './assets/torch2.png';

export const PI_180 = Math.PI / 180;

export const PI_2 = Math.PI / 2;

export const RANDOM_NUMBERS_COUNT = 100;

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
  DOOR = 'DOOR',
  ENEMY = 'ENEMY',
  GUN = 'GUN',
  SHOOT_MARK = 'SHOOT_MARK',
  TRIGGER = 'TRIGGER',
};

const GAME_SPEED = 1100;
const ENEMY_GAME_SPEED = GAME_SPEED / 70;
const BASE_DISTANCE = 20;

export const WALL = {
  SIZE: 3
};

export const DOOR = {
  OPEN_SPEED: 15
};

export const FLYING_ENEMY = {
  HP: 1,
  FLYING_SPEED: 10,
  SHAKE_SPEED: 5,
  SHAKE_DISTANCE: 5,
  Y_POS: 3
};

export const ENEMY = {
  WALK_SPEED: ENEMY_GAME_SPEED * 0.5,
  BULLET_SPEED: ENEMY_GAME_SPEED * 4,
  MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.1,
  HURT_TIME_OUT: 0.1,
  SHOOT_TIME_OUT: ENEMY_GAME_SPEED * 0.05,
  ATTACK_DISTANCE: BASE_DISTANCE
};

export const PLAYER = {
  HP: 10,
  WALK_SPEED: GAME_SPEED,
  WALK_INERTIA: 15,
  BODY_WIDTH: 1.5,
  BODY_HEIGHT: 1.5,
  BODY_DEPTH: 1.5,
  CAMERA_ROTATION_SPEED: Math.PI * 0.5
};

export const HUD = {
  MAP_SIZE: 256,
  MAP_RENDER_DISTANCE: 64,
  STATS_SIZE: 512,
  STATS_FONT_SIZE: 70,
  COLORS: {
    room: 'blue',
    roomCurrent: 'red',
    roomFree: 'green',
    stats: 'red'
  }
};

export const enum EVENT_TYPES {
  DELETE_ENTITIY,
  ENEMY_SHOOT
};

export const gameTextures = {
  wallTextureFile,
  wallNormalFile,
  doorTextureFile,
  doorNormalFile,
  floorTextureFile,
  gunTextureFile,
  gunFireFile,
  enemyWalk1,
  enemyWalk2,
  enemyDeath,
  shootMark1,
  shootMark2,
  torch,
  torchFire1,
  torchFire2
};

export const gameSounds = {
  gunShoot
};

export const enum GAME_TEXTURE_NAME {
  wallTextureFile = 'wallTextureFile',
  wallNormalFile = 'wallNormalFile',
  doorTextureFile = 'doorTextureFile',
  doorNormalFile = 'doorNormalFile',
  floorTextureFile = 'floorTextureFile',
  gunTextureFile = 'gunTextureFile',
  gunFireFile = 'gunFireFile',
  enemyWalk1 = 'enemyWalk1',
  enemyWalk2 = 'enemyWalk2',
  enemyDeath = 'enemyDeath',
  shootMark1 = 'shootMark1',
  shootMark2 = 'shootMark2',
  torch = 'torch',
  torchFire1 = 'torchFire1',
  torchFire2 = 'torchFire2',
};

export const enum GAME_SOUND_NAME {
  gunShoot = 'gunShoot'
};
