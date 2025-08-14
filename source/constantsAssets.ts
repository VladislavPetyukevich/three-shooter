import spriteSheet from './assets/spritesheet.png';
import sfx from './assets/sfx.mp3';
import { ImagesInfo } from '@/SpriteSheetLoader';
import { SliceInfo } from './core/AudioSlices';

export { spriteSheet };

export const spriteCellSize = 64;

export const gameTextures: ImagesInfo = {
  wallTextureFile: { x: 0, y: 3, },
  wallApathyTextureFile: { x: 0, y: 24, },
  wallCowardiceTextureFile: { x: 1, y: 14, },
  wallSPTextureFile: { x: 1, y: 17, },
  wallDecal1TextureFile: { x: 0, y: 5, },
  wallDecal2TextureFile: { x: 0, y: 6, },
  wallDecal3TextureFile: { x: 1, y: 6, },
  doorTextureFile: { x: 1, y: 11, },
  floorTextureFile: { x: 1, y: 3, },
  gunTextureFile: { x: 0, y: 7, },
  gunFireFile: { x: 1, y: 7, },
  machinegunTextureFile: { x: 0, y: 8, },
  machinegunFireFile: { x: 1, y: 8, },
  boomerangTextureFile: { x: 0, y: 9, },
  boomerangFireTextureFile: { x: 1, y: 9, },
  enemyApathyWalk1: { x: 0, y: 0, },
  enemyApathyWalk2: { x: 1, y: 0, },
  enemyApathyWalk3: { x: 0, y: 1, },
  enemyApathyWalk4: { x: 1, y: 1, },
  enemyApathyHurt: { x: 0, y: 2, },
  enemyApathyDeath1: { x: 0, y: 18, },
  enemyApathyDeath2: { x: 1, y: 18, },
  enemyApathyDeath3: { x: 0, y: 19, },
  enemyApathyDeath4: { x: 1, y: 19, },
  enemyApathyAttack: { x: 0, y: 25, },
  enemyCowardiceWalk1: { x: 0, y: 12, },
  enemyCowardiceWalk2: { x: 1, y: 12, },
  enemyCowardiceWalk3: { x: 0, y: 13, },
  enemyCowardiceWalk4: { x: 1, y: 13, },
  enemyCowardiceHurt: { x: 0, y: 14, },
  enemyCowardiceDeath1: { x: 0, y: 20, },
  enemyCowardiceDeath2: { x: 1, y: 20, },
  enemyCowardiceDeath3: { x: 0, y: 21, },
  enemyCowardiceDeath4: { x: 1, y: 21, },
  enemyCowardiceAttack: { x: 1, y: 25, },
  enemySPWalk1: { x: 0, y: 15, },
  enemySPWalk2: { x: 1, y: 15, },
  enemySPWalk3: { x: 0, y: 16, },
  enemySPWalk4: { x: 1, y: 16, },
  enemySPHurt: { x: 0, y: 17, },
  enemySPDeath1: { x: 0, y: 22, },
  enemySPDeath2: { x: 1, y: 22, },
  enemySPDeath3: { x: 0, y: 23, },
  enemySPDeath4: { x: 1, y: 23, },
  enemySPAttack: { x: 0, y: 26, },
  shootMark1: { x: 1, y: 4, },
  shootMark2: { x: 1, y: 2, },
  torch: { x: 0, y: 10, },
  torchFire1: { x: 0, y: 11, },
  torchFire2: { x: 1, y: 10, },
  fireFlare: { x: 1, y: 4, },
  fireFlareAlpha: { x: 1, y: 5, },
  skybox: { x: 0, y: 4, },
};

export const gameSounds = {
  sfx,
};

const playerAudioVolume = 0.2;
const enemyAudioVolume = 0.4;

export type AudioSliceName =
  'damage' |
  'shootShotgun' |
  'shootMachinegun' |
  'spawn' |
  'walk' |
  'hit';

export const gameAudioSlices: Record<AudioSliceName, SliceInfo> = {
  damage: {
    soundName: 'sfx',
    start: 0.05, end: 0.20, volume: playerAudioVolume,
  },
  shootShotgun: {
    soundName: 'sfx',
    start: 0.23, end: 0.48, volume: playerAudioVolume,
  },
  shootMachinegun: {
    soundName: 'sfx',
    start: 0.49, end: 0.62, volume: playerAudioVolume,
  },
  spawn: {
    soundName: 'sfx',
    start: 0.66, end: 0.94, volume: enemyAudioVolume,
  },
  walk: {
    soundName: 'sfx',
    start: 0.96, end: 7.34, volume: playerAudioVolume,
  },
  hit: {
    soundName: 'sfx',
    start: 7.36, end: 7.40, volume: playerAudioVolume,
  },
};

export interface EnemyTexturesSet {
  walk1: keyof typeof gameTextures;
  walk2: keyof typeof gameTextures;
  walk3: keyof typeof gameTextures;
  walk4: keyof typeof gameTextures;
  hurt: keyof typeof gameTextures;
  death1: keyof typeof gameTextures;
  death2: keyof typeof gameTextures;
  death3: keyof typeof gameTextures;
  death4: keyof typeof gameTextures;
  attack: keyof typeof gameTextures;
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
    walk3: 'enemyApathyWalk3',
    walk4: 'enemyApathyWalk4',
    hurt: 'enemyApathyHurt',
    death1: 'enemyApathyDeath1',
    death2: 'enemyApathyDeath2',
    death3: 'enemyApathyDeath3',
    death4: 'enemyApathyDeath4',
    attack: 'enemyApathyAttack',
  },
  Cowardice: {
    walk1: 'enemyCowardiceWalk1',
    walk2: 'enemyCowardiceWalk2',
    walk3: 'enemyCowardiceWalk3',
    walk4: 'enemyCowardiceWalk4',
    hurt: 'enemyCowardiceHurt',
    death1: 'enemyCowardiceDeath1',
    death2: 'enemyCowardiceDeath2',
    death3: 'enemyCowardiceDeath3',
    death4: 'enemyCowardiceDeath4',
    attack: 'enemyCowardiceAttack',
  },
  SP: {
    walk1: 'enemySPWalk1',
    walk2: 'enemySPWalk2',
    walk3: 'enemySPWalk3',
    walk4: 'enemySPWalk4',
    hurt: 'enemySPHurt',
    death1: 'enemySPDeath1',
    death2: 'enemySPDeath2',
    death3: 'enemySPDeath3',
    death4: 'enemySPDeath4',
    attack: 'enemySPAttack',
  },
};
