type MindProperty = 'apathy' | 'cowardice' | 'sexualPerversions';

export type MindStateProps = Record<MindProperty, number>;

interface MindStateValue {
  count: MindStateProps;
  level: MindStateProps;
};

interface MindStatePersistValue {
  totalCount: number;
};

export class MindState {
  levelCount: number;
  onLevelIncreaseCallbacks: Function[];
  localStorageKey: string;
  value: MindStateValue;
  persistValue: MindStatePersistValue;

  constructor() {
    this.levelCount = 2;
    this.onLevelIncreaseCallbacks = [];
    this.localStorageKey = 'mindState';
    this.value = {
      count: this.getInitialValues(),
      level: this.getInitialValues(),
    };
    this.persistValue = {
      totalCount: 0,
    };
    this.loadFromLocalStorage();
  }

  getLevel(propName: MindProperty) {
    return this.value.level[propName];
  }

  checkIsAllLevelsEqual() {
    return Object.values(this.value.level).every(
      (val, _, vals) => val === vals[0]
    );
  }

  getMinLevel() {
    return Math.min(
      ...Object.values(this.value.level)
    );
  }

  increaseCount(prop: MindProperty) {
    this.value.count[prop]++;
    this.persistValue.totalCount++;
    if (this.checkIsPropReachLevel(prop)) {
      this.increaseLevel(prop);
      this.onLevelIncrease(prop, this.getLevel(prop));
    }
    this.saveToLocalStorage();
  }

  resetValue() {
    this.value = {
      count: this.getInitialValues(),
      level: this.getInitialValues(),
    };
  }

  addLevelIncreaseListener(callback: Function) {
    this.onLevelIncreaseCallbacks.push(callback);
  }

  removeLevelIncreaseListener(callback: Function) {
    this.onLevelIncreaseCallbacks =
      this.onLevelIncreaseCallbacks.filter(cb => cb !== callback);
  }

  checkIsPropReachLevel(prop: MindProperty) {
    return this.value.count[prop] % this.levelCount === 0;
  }

  private saveToLocalStorage() {
    new Promise(this.saveToLocalStorageCallback);
  }

  private saveToLocalStorageCallback = (resolve: Function) => {
    const stringified = JSON.stringify(this.persistValue);
    localStorage.setItem(this.localStorageKey, stringified);
    resolve();
  }

  private loadFromLocalStorage() {
    new Promise(this.loadFromLocalStorageCallback)
      .then((persistValue) => {
        this.persistValue = persistValue;
      })
      .catch(() => {});
  }

  private loadFromLocalStorageCallback = (
    resolve: (persistValue: MindStatePersistValue) => void,
    reject: () => void,
  ) => {
    try {
      const stringified = localStorage.getItem(this.localStorageKey);
      if (!stringified) {
        reject();
        return;
      }
      const parsed = JSON.parse(stringified);
      if (
        parsed.totalCount &&
        typeof parsed.totalCount === 'number'
      ) {
        resolve(parsed);
      }
    } catch (error) {
      reject();
    }
  }

  private increaseLevel(prop: MindProperty) {
    this.value.level[prop]++;
  }

  private onLevelIncrease(prop: MindProperty, value: number) {
    this.onLevelIncreaseCallbacks.forEach(callback => callback(prop, value));
  }

  private getInitialValues() {
    const initialValue = 0;
    return {
      apathy: initialValue,
      cowardice: initialValue,
      sexualPerversions: initialValue,
    };
  }
}

export const mindState = new MindState();
