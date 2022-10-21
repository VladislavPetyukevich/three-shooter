import { Color } from 'three';
import wallTextureFile from '@/assets/wall.png';
import doorTextureFile from '@/assets/door.png';
import floorTextureFile from '@/assets/floor.png';
import gunTextureFile from './assets/gun.png';
import gunFireFile from './assets/gunFire.png';
import machinegunTextureFile from './assets/machinegun.png';
import machinegunFireFile from './assets/machinegunFire.png';
import enemyApathyWalk1 from './assets/enemyWalk1.png';
import enemyApathyWalk2 from './assets/enemyWalk2.png';
import enemyApathyDeath from './assets/enemyDeath.png';
import enemyCowardiceWalk1 from './assets/enemyCowardiceWalk1.png';
import enemyCowardiceWalk2 from './assets/enemyCowardiceWalk2.png';
import enemyCowardiceDeath from './assets/enemyCowardiceDeath.png';
import enemySPWalk1 from './assets/enemySPWalk1.png';
import enemySPWalk2 from './assets/enemySPWalk2.png';
import enemySPDeath from './assets/enemySPDeath.png';
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

export const enum ENTITY_TYPE {
  PLAYER = 'PLAYER',
  BULLET = 'BULLET',
  WALL = 'WALL',
  ENEMY = 'ENEMY',
  GUN = 'GUN',
  SHOOT_MARK = 'SHOOT_MARK',
  TORCH = 'TORCH',
  TRIGGER = 'TRIGGER',
  GUN_PICK_UP = 'GUN_PICK_UP',
  ENEMY_SPAWNER = 'ENEMY_SPAWNER',
};

const createColor = (r: number, g: number, b: number) => {
  return new Color(r / 255, g / 255, b / 255);
};

const DarkColor = createColor(0, 0, 0);
const WhiteColor = createColor(1, 1, 1);

const lerpColor = (colorOriginal: Color, color: Color, factor: number) => {
  const newColor = colorOriginal.clone();
  return newColor.lerp(color, factor);
};

export const darker = (color: Color, factor: number) => {
  return lerpColor(color, DarkColor, factor);
};

export const lighter = (color: Color, factor: number) => {
  return lerpColor(color, WhiteColor, factor);
};

export const COLORS = {
  Apathy: createColor(42, 140, 186),
  Cowardice: createColor(104, 142, 11),
  SexualPerversions: createColor(166, 15, 11),
};

const wallDarkerFactor = 0.8;
export const WALL_COLORS = {
  Neutral: darker(createColor(180, 180, 180), wallDarkerFactor),
  Apathy: darker(COLORS.Apathy, wallDarkerFactor),
  Cowardice: darker(COLORS.Cowardice, wallDarkerFactor),
  SexualPerversions: darker(COLORS.SexualPerversions, wallDarkerFactor),
};

const enemyDarkerFactor = 0.0;
export const ENEMY_COLORS = {
  Apathy: darker(createColor(37, 178, 178), enemyDarkerFactor),
  Cowardice: darker(createColor(105, 194, 15), enemyDarkerFactor),
  SP: darker(createColor(177, 180, 203), enemyDarkerFactor),
  PARASITE_LIGHTER_FACTOR: 0.9,
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
  WALK_SPEED_FACTOR_KAMIKAZE: 1.4,
  WALK_SPEED_FACTOR_PARASITE: 1.5,
  BULLET_SPEED: ENEMY_GAME_SPEED * 3.5,
  MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.1,
  KAMIKAZE_MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.04,
  HURT_TIME_OUT: 0.2,
  SHOOT_TIME_OUT: ENEMY_GAME_SPEED * 0.05,
  SHOOT_TRIGGER_PULLED: ENEMY_GAME_SPEED * 0.05,
  ATTACK_DISTANCE: BASE_DISTANCE,
  ATTACK_DISTANCE_LONG_RANGE: BASE_DISTANCE * 1.5,
  ATTACK_DISTANCE_PARASITE: 2.5,
  PARASITE_HP_BOOST_MIN: 1,
  PARASITE_HP_BOOST_FACTOR: 0.5,
  DELAYS: {
    shoot: 0.7,
    gunpointStrafe: 0.5,
    strafe: 0.7,
  },
};

export const PLAYER = {
  HP: 10,
  WALK_SPEED: GAME_SPEED * 0.01818181818181818,
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
  infestedByParasite,
};

export const gameTextures = {
  wallTextureFile,
  doorTextureFile,
  floorTextureFile,
  gunTextureFile,
  gunFireFile,
  machinegunTextureFile,
  machinegunFireFile,
  enemyApathyWalk1,
  enemyApathyWalk2,
  enemyApathyDeath,
  enemyCowardiceWalk1,
  enemyCowardiceWalk2,
  enemyCowardiceDeath,
  enemySPWalk1,
  enemySPWalk2,
  enemySPDeath,
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
  doorNormalFile = 'doorNormalFile',
  floorTextureFile = 'floorTextureFile',
  gunTextureFile = 'gunTextureFile',
  gunFireFile = 'gunFireFile',
  machinegunTextureFile = 'machinegunTextureFile',
  machinegunFireFile = 'machinegunFireFile',
  enemyApathyWalk1 = 'enemyApathyWalk1',
  enemyApathyWalk2 = 'enemyApathyWalk2',
  enemyApathyDeath = 'enemyApathyDeath',
  enemyCowardiceWalk1 = 'enemyCowardiceWalk1',
  enemyCowardiceWalk2 = 'enemyCowardiceWalk2',
  enemyCowardiceDeath = 'enemyCowardiceDeath',
  enemySPWalk1 = 'enemySPWalk1',
  enemySPWalk2 = 'enemySPWalk2',
  enemySPDeath = 'enemySPDeath',
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
    walk1: GAME_TEXTURE_NAME.enemyCowardiceWalk1,
    walk2: GAME_TEXTURE_NAME.enemyCowardiceWalk2,
    death: GAME_TEXTURE_NAME.enemyCowardiceDeath,
  },
  SP: {
    walk1: GAME_TEXTURE_NAME.enemySPWalk1,
    walk2: GAME_TEXTURE_NAME.enemySPWalk2,
    death: GAME_TEXTURE_NAME.enemySPDeath,
  },
};

export const enum GAME_SOUND_NAME {
  gunShoot = 'gunShoot',
  damage = 'damage',
  spawn = 'spawn',
};
