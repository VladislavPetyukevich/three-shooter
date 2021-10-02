type MindProperties = 'apathy' | 'cowardice' | 'sexualPerversions';

export type MindStateProps = Record<MindProperties, number>;

interface MindStateValue {
  props: MindStateProps;
  levels: MindStateProps;
};

export class MindState {
  initialValue: number;
  increaseAmount: number;
  onUpdateCallbacks: Function[];
  onLevelIncreaseCallbacks: Function[];
  localStorageKey: string;
  maxPropValue: number;
  value: MindStateValue;

  constructor() {
    this.initialValue = 0;
    this.increaseAmount = 0.01;
    this.onUpdateCallbacks = [];
    this.onLevelIncreaseCallbacks = [];
    this.localStorageKey = 'mindState';
    this.value = {
      props: this.getInitialProps(),
      levels: this.getInitialProps(),
    };
    this.maxPropValue = 0.05;
    this.loadFromLocalStorage();
  }

  getProps() {
    return this.value.props;
  }

  getLevel() {
    return this.value.levels;
  }

  increaseValue(prop: MindProperties) {
    this.value.props[prop] += this.increaseAmount;
    if (this.checkIsPropReachMaxValue(prop)) {
      this.updateLevel(prop);
    }
    this.onUpdate();
    this.saveToLocalStorage();
  }

  updateLevel(prop: MindProperties) {
    this.value.props[prop] = this.initialValue;
    this.value.levels[prop]++;
    this.onLevelIncrease();
  }

  saveToLocalStorage() {
    new Promise(this.saveToLocalStorageCallback);
  }

  saveToLocalStorageCallback = (resolve: Function) => {
    const stringified = JSON.stringify(this.value);
    localStorage.setItem(this.localStorageKey, stringified);
    resolve();
  }

  loadFromLocalStorage() {
    new Promise(this.loadFromLocalStorageCallback)
      .then((value) => {
        this.value = value;
        this.onUpdate();
      })
      .catch(() => {});
  }

  loadFromLocalStorageCallback = (
    resolve: (value: MindStateValue) => void,
    reject: () => void,
  ) => {
    try {
      const checkIsValid = (value: Record<any, any>) => (
        (typeof value.apathy === 'number') &&
        (typeof value.cowardice === 'number') &&
        (typeof value.sexualPerversions === 'number')
      );

      const stringified = localStorage.getItem(this.localStorageKey);
      if (!stringified) {
        return;
      }
      const parsed = JSON.parse(stringified);
      if (
        (parsed.props) &&
        (checkIsValid(parsed.props)) &&
        (parsed.levels) &&
        (checkIsValid(parsed.levels))
      ) {
        resolve({
          props: {
            apathy: parsed.props.apathy,
            cowardice: parsed.props.cowardice,
            sexualPerversions: parsed.props.sexualPerversions,
          },
          levels: {
            apathy: parsed.levels.apathy,
            cowardice: parsed.levels.cowardice,
            sexualPerversions: parsed.levels.sexualPerversions,
          },
        });
      }
    } catch (error) {
      reject();
    }
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  addLevelIncreaseListener(callback: Function) {
    this.onLevelIncreaseCallbacks.push(callback);
  }

  removeLevelIncreaseListener(callback: Function) {
    this.onLevelIncreaseCallbacks =
      this.onLevelIncreaseCallbacks.filter(cb => cb !== callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }

  onLevelIncrease() {
    this.onLevelIncreaseCallbacks.forEach(callback => callback());
  }

  checkIsPropReachMaxValue(prop: MindProperties) {
    return this.value.props[prop] >= this.maxPropValue;
  }

  getInitialProps() {
    return {
      apathy: this.initialValue,
      cowardice: this.initialValue,
      sexualPerversions: this.initialValue,
    };
  }
}

export const mindState = new MindState();

