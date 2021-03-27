import { IPoint } from './IPoint';

export interface IGoogeVisonElement {
  description: string;
  boundingPoly: {
    vertices: Array<IPoint>;
  };
  [x: string]: any;
}
