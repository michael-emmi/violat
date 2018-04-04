import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('spec:strengthening');

import { Spec, Method } from './spec';

type ResultType = { newSpec: Spec, attribute: string };

export interface SpecStrengthener {
  getStrengthenings({ spec, method }): Iterable<ResultType>;

}
