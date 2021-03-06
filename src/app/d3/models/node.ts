import APP_CONFIG from '../../../../../angular-d3-graph-example/src/app/app.config';

export class Node implements d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  id: string;
  linkCount: number = 0;

  label: string;
  colorString: string = 'rgb(118, 177, 227)';

  constructor(id, label, colorString) {
    this.id = id;
    this.label = label;
    this.colorString = colorString;
  }

  normal = () => {
    return Math.sqrt(this.linkCount);
  };

  get r() {
    return 50 * this.normal() + 30;
  }

  get fontSize() {
    return (20 * this.normal() + 10) + 'px';
  }

  get color() {
    // let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    // return APP_CONFIG.SPECTRUM[index];

    //'rgb(85,193,179)' NEM Green

    return this.colorString;
    // return 'rgb(118, 177, 227)';
  }
}
