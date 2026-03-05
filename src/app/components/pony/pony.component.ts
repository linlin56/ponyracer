import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { PonyModel } from '../../models/pony.model';

@Component({
  selector: 'app-pony',
  standalone: true,
  imports: [NgClass],
  template: `
    <figure
      class="pony-figure"
      [ngClass]="{ selected: isSelected(), boosted: pony().boosted }"
      (click)="onClick()"
    >
      <img
        [src]="getPonyImage()"
        [alt]="pony().name"
        class="pony-img"
        (error)="onImgError($event)"
      />
      <figcaption>{{ pony().name }}</figcaption>
    </figure>
  `,
  styles: [
    `
      .pony-figure {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        padding: 4px;
        border: 2px solid transparent;
        border-radius: 4px;
        transition: border-color 0.2s;
      }
      .pony-figure.selected {
        border-color: #28a745;
      }
      .pony-img {
        width: 70px;
        height: 70px;
        object-fit: contain;
      }
      figcaption {
        font-size: 0.75rem;
        text-align: center;
      }
      .boosted .pony-img {
        filter: brightness(1.3) saturate(1.5);
      }
    `,
  ],
})
export class PonyComponent {
  pony = input.required<PonyModel>();
  isSelected = input<boolean>(false);
  ponyClicked = output<PonyModel>();

  getPonyImage(): string {
    const color = this.pony().color?.toLowerCase() ?? 'blue';
    return `/assets/ponies/pony_${color}.gif`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://placehold.co/70x70?text=${this.pony().color}`;
  }

  onClick(): void {
    this.ponyClicked.emit(this.pony());
  }
}
