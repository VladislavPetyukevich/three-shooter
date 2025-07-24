import { Color, Vector2 } from 'three';

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

export const DECAL_COLOR = new Color(0x770000);

const GAME_SPEED = 1100;
const ENEMY_GAME_SPEED = GAME_SPEED / 70;
const BASE_DISTANCE = 20;

const roomSizeScale = 1;
export const roomSize = new Vector2(20 * roomSizeScale, 20 * roomSizeScale);

export const enemiesFromSpawnerCount = 2;

export const WALL = {
  SIZE: 3
};

export const DOOR = {
  OPEN_SPEED: 15
};

export const ENEMY = {
  WALK_SPEED: ENEMY_GAME_SPEED * 0.6,
  WALK_SPEED_FACTOR_KAMIKAZE: 1.4,
  WALK_SPEED_FACTOR_PARASITE: 1.5 * 2,
  BULLET_SPEED: ENEMY_GAME_SPEED * 3.5,
  MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.1,
  KAMIKAZE_MOVEMENT_TIME_OUT: ENEMY_GAME_SPEED * 0.04,
  HURT_TIME_OUT: 0.2,
  BLEED_TIME_OUT: 5,
  SHOOT_TIME_OUT: 3,
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
  FIRST_PHASE_TIME: 15.0,
};

export const enum ENTITY_MESSAGES {
  inPlayerGunpoint,
  boomerangReturned,
  infestedByParasite,
};
