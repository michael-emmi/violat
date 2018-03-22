const assert = require('assert');
const debug = require('debug')('history-encoding');
const detail = require('debug')('history-encoding:detail');

const { Event, Trace, History } = require('../history.js');

class HistoryEncoding {
  constructor(schema) {
    this.schema = schema;
  }

  encode(sequence, exprs) {
    let encoding = sequence.invocations.map((inv,idx) => {
      return [0,1].map(j => {
        return this.schema.sequences
          .filter(s => s !== sequence)
          .map((s,i) => `"${s.id}@" + ${exprs.counter(2*idx+j, i)}`)
          .join(` + ":" + `)
          + ` + "/" + ${j ? exprs.result(idx) : `"_"`}`;
      }).join(` + ";" + `);
    }).join(` + ";" + `);
    debug(`encode(%o, …) = %s`, sequence, encoding);
    return encoding;
  }

  decode(string) {
    let sequences = this._parse(string);
    let indices = Object.keys(sequences);
    let counters = indices.reduce((cs,i) => Object.assign({}, cs, {[i]: 0}), {});
    let events = [];

    detail(`generating events for schema %j`, this.schema);

    while (indices.some(i => counters[i] < Object.keys(sequences[i]).length)) {
      assert.ok(this._consistent(sequences, counters), "inconsistent order");

      detail(`counters: %o`, counters);
      for (let i of indices) {
        let pcs = sequences[i][counters[i]];
        if (pcs && indices.every(j => j === i || pcs[j] <= counters[j])) {
          let invIdx = Math.floor(counters[i] / 2);
          let isCall = counters[i] % 2 === 0 ;
          let event = new Event({
            kind: isCall ? 'call' : 'return',
            sid: +i,
            invocation: this.schema.sequences.find(s => s.id == i).invocations[invIdx],
            value: (!isCall && pcs.result !== 'void') ? pcs.result : undefined
          });
          detail(`got event: %o`, event);
          events.push(event);
          counters[i]++;
          break;
        }
      }
    }
    let schema = this.schema;
    let history = new Trace({schema, events});
    debug(`decode(%s) = %s`, string, history);
    return history;
  }

  _consistent(sequences, counters) {
    let indices = Object.keys(sequences);
    return indices.some(i => indices.some(j => sequences[i][counters[i]] && sequences[i][counters[i]][j] <= counters[j]));
  }

  _parse(string) {
    let sequences = {};
    detail(`parsing string: %s`, string);

    string.split(/,\s*(?=\d+@\d+)/).forEach((resultStr, resultIdx) => {
      let thisSeqIdx = this.schema.sequences[resultIdx].id;
      sequences[thisSeqIdx] = {};

      resultStr.split(';').forEach((stepStr, stepIdx) => {
        sequences[thisSeqIdx][stepIdx] = {};

        let [pcsStr, rvStr] = stepStr.split('/');

        pcsStr.split(':').forEach((entryStr, entryIdx) => {
          let [thatSeqIdx, thatSeqPc] = entryStr.split('@');
          sequences[thisSeqIdx][stepIdx][thatSeqIdx] = thatSeqPc;
        });

        sequences[thisSeqIdx][stepIdx].result = rvStr;
      });
    });
    debug(`parse(%s) = %o`, string, sequences);
    return sequences;
  }
}

module.exports = HistoryEncoding;
