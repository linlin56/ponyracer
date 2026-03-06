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
        border: 2px solid transparent;
        border-radius: 4px;
        transition: border-color 0.2s;
      }
      .pony-figure.selected {
        border-color: #13d941;
      }
      .pony-img {
        /* image du poney */
        width: 50px;
        height: 50px;
        object-fit: contain;
      }
      figcaption {
        font-size: 0.5rem;
        text-align: center;
        color: white;
        text-shadow: 0 0 3px #000;
      }
      .boosted .pony-img {
        /* Quand le poney est boosté, son rendu devient arc-en-ciel */
        filter: hue-rotate(0deg) saturate(2);
        animation: rainbow 2s infinite linear;
      }

      @keyframes rainbow {
        to {
          filter: hue-rotate(360deg) saturate(2);
        }
      }
    `,
  ],
})
export class PonyComponent {
  pony = input.required<PonyModel>();
  isSelected = input<boolean>(false);
  ponyClicked = output<PonyModel>();

  getPonyImage(): string {
    // Par défaut, on utilise l'image correspondant à la couleur du poney
    const color = this.pony().color?.toLowerCase() ?? 'blue';
    return `/assets/ponies/pony_${color}.gif`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://placehold.co/70x70?text=${this.pony().color}`;
  }

  // Quand on clique sur le poney, on émet un événement pour le booster
  onClick(): void {
    this.ponyClicked.emit(this.pony());
  }
}
