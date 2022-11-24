/**
 * Animation to make an item swipe out of the screen on the left side, while fading it out.
 */
import {animate, style, transition, trigger} from '@angular/animations';

export const swipeLeftAnimation = trigger('swipeLeft', [
  transition(':leave', [
    style({transform: 'translateX(0)', opacity: 1}),
    animate('0.5s ease-in-out', style({transform: 'translateX(-100%)', opacity: 0}))
  ])
]);
