export interface GameRoot {
  results: Result[];
}

export interface Result {
  id: number;
  name: string;
  background_image: string;
}

export interface Game extends Result {
  map(arg0: (game: Game) => import('react').JSX.Element): import('react').ReactNode;
  title: string;
  platforms: Array<{ name: string; value: number }>;
  description: string;
  description_raw: string;
  tags: Array<{ name: string; value: number }>;
}
