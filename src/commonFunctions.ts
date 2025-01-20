export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
