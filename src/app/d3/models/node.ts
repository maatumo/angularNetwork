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

  constructor(id, label) {
    this.id = id;
    this.label = label;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  };

  get r() {
    return 50 * this.normal() + 30;
  }

  get fontSize() {
    return (30 * this.normal() + 10) + 'px';
  }

  get color() {
    // let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    // return APP_CONFIG.SPECTRUM[index];

    return 'rgb(85,193,179)';
  }
}
