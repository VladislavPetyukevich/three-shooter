interface SinTableProps {
  step: number;
  amplitude: number;
}

export class SinTable {
  values: number[];
  currentIndex: number;

  constructor(props: SinTableProps) {
    this.values = this.generateSinTable(props.step, props.amplitude);
    this.currentIndex = 0;
  }

  getNextSinValue() {
    if (this.currentIndex === this.values.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
    return this.values[this.currentIndex];
  }

  generateSinTable(step: number, amplitude: number) {
    const sinTable = [];
    for (let i = 0; i < 360; i+=step) {
      const sinValue = Math.sin(this.toRadians(i));
      sinTable.push(amplitude * sinValue);
    }
    return sinTable;
  }

  toRadians(degrees:number) {
    return degrees * (Math.PI / 180);
  }
}
