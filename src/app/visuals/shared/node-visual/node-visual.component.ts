import {Component, Input} from '@angular/core';
import {Node} from '../../../d3';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g [attr.transform]="'translate(' + node.x + ',' + node.y + ')'" (click)="onNodeClick(node.label)">
      <svg:circle
        class="node"
        [attr.fill]="node.color"
        cx="0"
        cy="0"
        [attr.r]="node.r">
      </svg:circle>
      <svg:text
        class="node-name"
        [attr.font-size]="node.fontSize">
        {{node.label.slice(0, 5)}}
      </svg:text>
    </svg:g>
  `,
  styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent {
  @Input('nodeVisual') node: Node;

  onNodeClick(nodeLabel) {
    // alert(nodeLabel + 'を中心に探索します');
    alert(nodeLabel + '再探索する機能を開発中です。');

  }
}
