export interface Hue {
  color: string;
  wash: string;
}

export interface TitledText {
  title: string;
  body: string;
}

export interface FlowStep {
  name: string;
  sub: string;
}

export interface CompareColumn extends Hue {
  label: string;
  points: string[];
}

export interface CompareExample {
  title: string;
  trace: [string, string][];
  breaks: string;
}

export interface ExampledColumn extends CompareColumn {
  example: CompareExample;
}
