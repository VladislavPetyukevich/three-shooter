import { Color } from 'three';
import wallTextureFile from '@/assets/wall.png';
import doorTextureFile from '@/assets/door.png';
import floorTextureFile from '@/assets/floor.png';
import gunTextureFile from './assets/gun.png';
import gunFireFile from './assets/gunFire.png';
import enemyApathyWalk1 from './assets/enemyWalk1.png';
import enemyApathyWalk2 from './assets/enemyWalk2.png';
import enemyApathyDeath from './assets/enemyDeath.png';
import gunShoot from './assets/shoot.mp3';
import damage from './assets/damage.mp3';
import spawn from './assets/spawn.mp3';
import shootMark1 from './assets/shootMark1.png';
import shootMark2 from './assets/shootMark2.png';
import torch from './assets/torch.png';
import torchFire1 from './assets/torch1.png';
import torchFire2 from './assets/torch2.png';
import damageEffect from './assets/damage-effect.png';

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

const DarkColor = new Color(0);

const darker = (color: Color, factor: number) => {
  const newColor = color.clone();
  return newColor.lerp(DarkColor, factor);
};

export const COLORS = {
  Apathy: new Color(42, 140, 186),
  Cowardice: new Color(104, 142, 11),
  SexualPerversions: new Color(166, 15, 11),
};

const wallDarkerFactor = 0.9977;
export const WALL_COLORS = {
  Neutral: darker(new Color(180, 180, 180), wallDarkerFactor),
  Apathy: darker(COLORS.Apathy, wallDarkerFactor),
  Cowardice: darker(COLORS.Cowardice, wallDarkerFactor),
  SexualPerversions: darker(COLORS.SexualPerversions, wallDarkerFactor),
};

const enemyDarkerFactor = 0.9;
export const ENEMY_COLORS = {
  Apathy: darker(new Color(2470578), enemyDarkerFactor),
  Cowardice: darker(new Color(6930959), enemyDarkerFactor),
  SP: darker(new Color(11646155), enemyDarkerFactor),
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
  WALK_SPEED: ENEMY_GAME_SPEED * 0.6,
  BULLET_SPEED: ENEMY_GAME_SPEED * 3.5,
  MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.1,
  HURT_TIME_OUT: 0.1,
  SHOOT_TIME_OUT: ENEMY_GAME_SPEED * 0.05,
  ATTACK_DISTANCE: BASE_DISTANCE,
  DELAYS: {
    shoot: 0.7,
    gunpointStrafe: 0.5,
    strafe: 0.7,
  },
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

export const BOOMERANG = {
  SPEED: ENEMY.BULLET_SPEED * 0.5,
  FIRST_PHASE_TIME: 1.3,
};

export const enum ENTITY_MESSAGES {
  inPlayerGunpoint,
  boomerangReturned,
};

export const gameTextures = {
  wallTextureFile,
  doorTextureFile,
  floorTextureFile,
  gunTextureFile,
  gunFireFile,
  enemyApathyWalk1,
  enemyApathyWalk2,
  enemyApathyDeath,
  shootMark1,
  shootMark2,
  torch,
  torchFire1,
  torchFire2,
  damageEffect,
};

export const gameSounds = {
  gunShoot,
  damage,
  spawn,
};

export const enum GAME_TEXTURE_NAME {
  wallTextureFile = 'wallTextureFile',
  doorTextureFile = 'doorTextureFile',
  floorTextureFile = 'floorTextureFile',
  gunTextureFile = 'gunTextureFile',
  gunFireFile = 'gunFireFile',
  enemyApathyWalk1 = 'enemyApathyWalk1',
  enemyApathyWalk2 = 'enemyApathyWalk2',
  enemyApathyDeath = 'enemyApathyDeath',
  shootMark1 = 'shootMark1',
  shootMark2 = 'shootMark2',
  torch = 'torch',
  torchFire1 = 'torchFire1',
  torchFire2 = 'torchFire2',
  damageEffect = 'damageEffect',
};

export const ENEMY_TEXTURES = {
  Apathy: {
    walk1: GAME_TEXTURE_NAME.enemyApathyWalk1,
    walk2: GAME_TEXTURE_NAME.enemyApathyWalk2,
    death: GAME_TEXTURE_NAME.enemyApathyDeath,
  },
  Cowardice: {
    walk1: GAME_TEXTURE_NAME.enemyApathyWalk1,
    walk2: GAME_TEXTURE_NAME.enemyApathyWalk2,
    death: GAME_TEXTURE_NAME.enemyApathyDeath,
  },
  SP: {
    walk1: GAME_TEXTURE_NAME.enemyApathyWalk1,
    walk2: GAME_TEXTURE_NAME.enemyApathyWalk2,
    death: GAME_TEXTURE_NAME.enemyApathyDeath,
  },
};

export const enum GAME_SOUND_NAME {
  gunShoot = 'gunShoot',
  damage = 'damage',
  spawn = 'spawn',
};
