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
    if (this.i > this.values.length - 1) {
      this.i = 0;
    }
    return this.values[this.i];
  }
}

export const randomNumbers = new RandomNumbers(RANDOM_NUMBERS_COUNT);

