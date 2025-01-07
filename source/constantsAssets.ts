import spriteSheet from './assets/spritesheet.png';
import sfx from './assets/sfx.mp3';
import { ImagesInfo } from '@/SpriteSheetLoader';
import { SliceInfo } from './core/AudioSlices';

export { spriteSheet };

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
  skybox: { x: 0, y: 353, width: 32, height: 32, },
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
