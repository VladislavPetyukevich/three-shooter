export type Timeouts = Record<string, number>;

export class TimeoutsManager<K extends keyof Timeouts> {
  initialTimeOuts: Timeouts;
  currentTimeOuts: Timeouts;

  constructor(initialTimeouts: Record<K, number>) {
    this.initialTimeOuts = initialTimeouts;
    this.currentTimeOuts = {};
    Object.keys(initialTimeouts).forEach(timeoutKey =>
      this.currentTimeOuts[timeoutKey] = this.initialTimeOuts[timeoutKey]
    );
  }

  updateTimeOut(name: K, delta: number) {
    this.currentTimeOuts[name] -= delta;
  }

  checkIsTimeOutExpired(name: K) {
    return this.currentTimeOuts[name] <= 0;
  }

  expireAllTimeOuts() {
    for (let name in this.currentTimeOuts) {
      this.currentTimeOuts[name] = 0;
    }
  }

  updateExpiredTimeOuts() {
    for (let name in this.currentTimeOuts) {
      this.updateExpiredTimeOut(name as K);
    }
  }

  updateExpiredTimeOut(name: K) {
    if (this.currentTimeOuts[name] <= 0) {
      this.currentTimeOuts[name] = this.initialTimeOuts[name];
    }
  }
}
