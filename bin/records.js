var es = require('event-stream');

module.exports = delimiter => ({

  count: readable => {
    return new Promise((resolve, reject) => {
      let count = 0;
      readable.pipe(es.split(delimiter))
        .on('data', data => { if (data.trim()) count++; })
        .on('end', () => resolve(count))
    })
  },

  get: readable => {
    return new Promise((resolve, reject) => {
      let records = [];
      readable.pipe(es.split(delimiter))
        .on('data', data => {
          if (data.trim())
            records.push(JSON.parse(data));
        })
        .on('end', () => { resolve(records); });
    });
  },

  put: (records, writable) => {
    return new Promise((resolve, reject) => {
      records.forEach(r => {
        writable.write(delimiter);
        writable.write(JSON.stringify(r, null, 2));
        writable.write('\n');
      });
      writable.end();
      writable.on('finish', resolve);
      writable.on('error', reject);
    });
  }

});
