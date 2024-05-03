type MindProperty = 'apathy' | 'cowardice' | 'sexualPerversions';

export type MindStateProps = Record<MindProperty, number>;

interface MindStatePersistValue {
  totalCount: number;
};

export class MindState {
  localStorageKey: string;
  persistValue: MindStatePersistValue;

  constructor() {
    this.localStorageKey = 'mindState';
    this.persistValue = {
      totalCount: 0,
    };
    this.loadFromLocalStorage();
  }

  increaseTotalCount() {
    this.persistValue.totalCount++;
    this.saveToLocalStorage();
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
}

export const mindState = new MindState();
