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
  HP: 1,
  WALK_SPEED: 18,
  SHOOT_SOUND_INDEX: 0
};

export const PLAYER = {
  HP: 100,
  WALK_SPEED: 30,
  SPHERE_RADIUS: 1.3,
  JUMP_VELOCITY: 15
};

export enum ENTITY_TYPE {
  INANIMATE,
  CREATURE
};

export const enum EVENT_TYPES {
  DELETE_ENTITIY,
  ENEMY_SHOOT
};
