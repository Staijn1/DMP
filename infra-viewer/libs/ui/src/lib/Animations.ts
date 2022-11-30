import {animate, style, transition, trigger} from '@angular/animations';

/**
 * Animation to swipe an element to the left, while decreasing its opacity
 * When the element is created, it is animated to slide in from the bottom, and fade in
 */
export const swipeLeftAnimation = trigger('swipeLeft', [
  transition(':enter', [
    style({transform: 'translateY(100%)', opacity: 0}),
    animate('0.5s ease-in-out', style({transform: 'translateY(0)', opacity: 1})),
  ]),
  transition(':leave', [
    style({transform: 'translateX(0)', opacity: 1}),
    animate('0.5s ease-in-out', style({transform: 'translateX(-100%)', opacity: 0}))
  ])
]);
