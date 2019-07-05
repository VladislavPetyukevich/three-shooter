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
  EYE_Y_POS: 2, // eyes are 2 meters above the ground
  JUMP_VELOCITY: 15
};

export const ENTITY = {
  TYPE: {
    INANIMATE: 'INANIMATE',
    CREATURE: 'CREATURE'
  }
};

export const EVENT_TYPES = {
  DELETE_ENTITIY: 'ENTITIES_CONTAINER_DELETE_ENTITIY',
  DELETE_ENEMY: 'ENTITIES_CONTAINER_DELETE_ENEMY',
  ENEMY_SHOOT: 'ENTITIES_CONTAINER_ENEMY_SHOOT'
};
