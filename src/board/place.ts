export interface place {
  x: number;
  y: number;
}

export const DIRECTIONS: place[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
];

export const movePlace = (start: place, d: place): place => {
  return { x: start.x + d.x, y: start.y + d.y };
};

export const negativePlace = (p: place): place => {
  return { x: -p.x, y: -p.y };
};
