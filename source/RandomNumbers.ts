import { RANDOM_NUMBERS_COUNT } from '@/constants';

export class RandomNumbers {
  m: number;
  a: number;
  c: number;
  seed: number;
  state: number;
  values: number[];
  i: number;

  constructor(size: number, seed?: number) {
    this.m = 0x80000000;
    this.a = 1103515245;
    this.c = 12345;
    this.seed = seed || Math.floor(Math.random() * (this.m - 1));
    this.state = this.seed;
    this.values = Array.from(
      { length: size },
      () => this.RNGNextFloat()
    );
    this.i = 0;
  }

  getRandom() {
    this.i++;
    if (this.i === this.values.length) {
      this.i = 0;
    }
    return this.values[this.i];
  }

  getRandomInRange(min: number, max: number) {
    return Math.floor(this.getRandom() * (max - min + 1)) + min;
  }

  private RNGNextFloat() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }
}

export const randomNumbers = new RandomNumbers(RANDOM_NUMBERS_COUNT);

