import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jcstress:histories');

import { HistoryEncoding } from '../history-encoding';
import { JCStressHistoryRecordingCodeGenerator } from './harness';

import { Schema } from '../../schema';
import { Result } from './reader';
import { JCStressRunner } from './executor';

export class JCStressHistoryGenerator extends JCStressRunner {
  schemas: Schema[];

  constructor(schemas, jars = [], javaHome, testName) {
    super(JCStressHistoryGenerator._codeGenerator(schemas, testName), jars, javaHome, { limits: {} });
    this.schemas = schemas;
  }

  static *_codeGenerator(schemas, id) {
    for (let schema of schemas)
      yield new JCStressHistoryRecordingCodeGenerator(schema, id, new HistoryEncoding(schema)).toString();
  }

  _resultData(result: Result) {
    let schema = this.schemas.find(s => s.id === result.index);
    let total = result.outcomes.reduce((tot,o) => tot + o.count, 0);
    return {
      histories: result.outcomes.map(o => {
        let h = new HistoryEncoding(schema).decode(o.value);
        let count = o.count;
        h.frequency = { count, total };
        return h;
      })
    };
  }
}
