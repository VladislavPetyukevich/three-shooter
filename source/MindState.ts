export interface MindStateProps {
  apathy: number;
  cowardice: number;
  sexualPerversions: number;
}

export class MindState {
  initialValue: number;
  increaseAmount: number;
  onUpdateCallbacks: Function[];
  localStorageKey: string;
  props: MindStateProps;

  constructor() {
    this.initialValue = 0;
    this.increaseAmount = 0.01;
    this.onUpdateCallbacks = [];
    this.localStorageKey = 'mindState';
    this.props = {
      apathy: this.initialValue,
      cowardice: this.initialValue,
      sexualPerversions: this.initialValue,
    };
    this.loadFromLocalStorage();
  }

  increaseValue(prop: keyof MindStateProps) {
    this.props[prop] += this.increaseAmount;
    this.onUpdate();
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    new Promise(this.saveToLocalStorageCallback);
  }

  saveToLocalStorageCallback = (resolve: Function) => {
    const stringified = JSON.stringify(this.props);
    localStorage.setItem(this.localStorageKey, stringified);
    resolve();
  }

  loadFromLocalStorage() {
    new Promise(this.loadFromLocalStorageCallback)
      .then((props) => {
        this.props = props;
        this.onUpdate();
      })
      .catch(() => {});
  }

  loadFromLocalStorageCallback = (
    resolve: (props: MindStateProps) => void,
    reject: () => void,
  ) => {
    try {
      const stringified = localStorage.getItem(this.localStorageKey);
      if (!stringified) {
        return;
      }
      const parsed = JSON.parse(stringified);
      if (
        (typeof parsed.apathy === 'number') &&
        (typeof parsed.cowardice === 'number') &&
        (typeof parsed.sexualPerversions === 'number')
      ) {
        resolve({
          apathy: parsed.apathy,
          cowardice: parsed.cowardice,
          sexualPerversions: parsed.sexualPerversions,
        });
      }
    } catch (error) {
      reject();
    }
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const mindState = new MindState();

