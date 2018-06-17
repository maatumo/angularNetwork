import {Component, Input} from '@angular/core';
import {Link} from '../../../d3';

@Component({
  selector: '[linkVisual]',
  //ng build --prodを通すため改変 ドットじゃなくてかっこ
  template: `
    <svg:line
      class="link"
      [attr.x1]="link.source['x']"
      [attr.y1]="link.source['y']"
      [attr.x2]="link.target['x']"
      [attr.y2]="link.target['y']"
    ></svg:line>
  `,
  styleUrls: ['./link-visual.component.css']
})
export class LinkVisualComponent {
  @Input('linkVisual') link: Link;
}
