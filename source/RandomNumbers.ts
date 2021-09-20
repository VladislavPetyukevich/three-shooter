import { RANDOM_NUMBERS_COUNT } from '@/constants';

class RandomNumbers {
  values: number[];
  i: number;

  constructor(size: number) {
    this.values = Array.from(
      { length: size },
      Math.random
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
}

export const randomNumbers = new RandomNumbers(RANDOM_NUMBERS_COUNT);

