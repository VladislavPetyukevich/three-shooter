import { Color } from 'three';
import spriteSheet from './assets/spritesheet.png';
import gunShoot from './assets/shoot.mp3';
import damage from './assets/damage.mp3';
import spawn from './assets/spawn.mp3';
import walk from './assets/walk.mp3';
import { ImagesInfo } from '@/SpriteSheetLoader';

export { spriteSheet };

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
  SHOOT_TRACE = 'SHOOT_TRACE',
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
  Apathy: createColor(23, 53, 255),
  Cowardice: createColor(245, 108, 22),
  SexualPerversions: createColor(255, 23, 57),
};

const wallDarkerFactor = 0.915;
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

export const ENEMY = {
  WALK_SPEED: ENEMY_GAME_SPEED * 0.6,
  WALK_SPEED_FACTOR_KAMIKAZE: 1.4,
  WALK_SPEED_FACTOR_PARASITE: 1.5,
  BULLET_SPEED: ENEMY_GAME_SPEED * 3.5,
  MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.1,
  KAMIKAZE_MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.04,
  HURT_TIME_OUT: 0.2,
  BLEED_TIME_OUT: 5,
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
    movement: ENEMY_GAME_SPEED * 0.1
  },
};

export const PLAYER = {
  HP: 100,
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

export const gameTextures: ImagesInfo = {
  wallTextureFile: { x: 0, y: 289, width: 32, height: 32, },
  wallDecal1TextureFile: { x: 32, y: 289, width: 16, height: 16, },
  wallDecal2TextureFile: { x: 32, y: 305, width: 16, height: 16, },
  wallDecal3TextureFile: { x: 48, y: 289, width: 16, height: 16, },
  doorTextureFile: { x: 0, y: 321, width: 128, height: 32, },
  floorTextureFile: { x: 80, y: 289, width: 16, height: 16, },
  gunTextureFile: { x: 0, y: 193, width: 64, height: 32, },
  gunFireFile: { x: 64, y: 193, width: 64, height: 32, },
  machinegunTextureFile: { x: 0, y: 225, width: 64, height: 32, },
  machinegunFireFile: { x: 64, y: 225, width: 64, height: 32, },
  boomerangTextureFile: { x: 0, y: 257, width: 64, height: 32, },
  boomerangFireTextureFile: { x: 64, y: 257, width: 64, height: 32, },
  enemyApathyWalk1: { x: 0, y: 0, width: 32, height: 64, },
  enemyApathyWalk2: { x: 32, y: 0, width: 32, height: 64, },
  enemyApathyDeath: { x: 64, y: 0, width: 32, height: 64, },
  enemyCowardiceWalk1: { x: 0, y: 129, width: 32, height: 64, },
  enemyCowardiceWalk2: { x: 32, y: 129, width: 32, height: 64, },
  enemyCowardiceDeath: { x: 64, y: 129, width: 32, height: 64, },
  enemySPWalk1: { x: 0, y: 65, width: 32, height: 64, },
  enemySPWalk2: { x: 32, y: 65, width: 32, height: 64, },
  enemySPDeath: { x: 64, y: 65, width: 32, height: 64, },
  shootMark1: { x: 91, y: 197, width: 1, height: 1, },
  shootMark2: { x: 8, y: 0, width: 1, height: 1, },
  torch: { x: 48, y: 305, width: 16, height: 16, },
  torchFire1: { x: 64, y: 289, width: 16, height: 16, },
  torchFire2: { x: 64, y: 305, width: 16, height: 16, },
  fireFlare: { x: 80, y: 305, width: 16, height: 16, },
  fireFlareAlpha: { x: 96, y: 289, width: 16, height: 16, },
  damageEffect: { x: 0, y: 353, width: 16, height: 16, },
};

export const gameSounds = {
  gunShoot,
  damage,
  spawn,
  walk,
};

export interface EnemyTexturesSet {
  walk1: keyof typeof gameTextures;
  walk2: keyof typeof gameTextures;
  death: keyof typeof gameTextures;
}

interface EnemyTextures {
  Apathy: EnemyTexturesSet;
  Cowardice: EnemyTexturesSet;
  SP: EnemyTexturesSet;
}

export const ENEMY_TEXTURES: EnemyTextures = {
  Apathy: {
    walk1: 'enemyApathyWalk1',
    walk2: 'enemyApathyWalk2',
    death: 'enemyApathyDeath',
  },
  Cowardice: {
    walk1: 'enemyCowardiceWalk1',
    walk2: 'enemyCowardiceWalk2',
    death: 'enemyCowardiceDeath',
  },
  SP: {
    walk1: 'enemySPWalk1',
    walk2: 'enemySPWalk2',
    death: 'enemySPDeath',
  },
};
