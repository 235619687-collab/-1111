export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Meditate',
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface ParticleState {
  shape: ShapeType;
  color: string;
  count: number;
}

export interface HandGesture {
  distance: number; // 0 to 1, representing how far apart hands are
  isActive: boolean;
}