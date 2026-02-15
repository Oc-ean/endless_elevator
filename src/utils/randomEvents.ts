


import type { GameEvent } from '@/types/game';

export const generateRandomEvent = (): GameEvent => {
  const events: GameEvent[] = [
    {
      id: 'power-cut',
      name: 'Power Cut',
      description: 'Limited vision! Watch out for hidden obstacles.',
      duration: 8000,
      weight: 40,
      onStart: () => {
        document.documentElement.classList.add('power-cut');
      },
      onEnd: () => {
        document.documentElement.classList.remove('power-cut');
      },
      update: () => {}
    },
    {
      id: 'monster-encounter',
      name: 'Monster Encounter',
      description: 'Something is in the shaft with you!',
      duration: 10000,
      weight: 30,
      onStart: () => {
        console.log('Monster appears!');
      },
      onEnd: () => {
        console.log('Monster retreats');
      },
      update: () => {}
    },
    {
      id: 'trap-mode',
      name: 'Trap Mode Activated',
      description: 'Multiple traps activating simultaneously!',
      duration: 6000,
      weight: 20,
      onStart: () => {
        console.log('Traps activated');
      },
      onEnd: () => {
        console.log('Traps deactivated');
      },
      update: () => {}
    }
  ];

  const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const event of events) {
    random -= event.weight;
    if (random <= 0) {
      return event;
    }
  }
  
  return events[0]!;
};