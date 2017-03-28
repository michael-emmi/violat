var es = require('event-stream');

function get(readable) {
  return new Promise((resolve, reject) => {
    let records = [];
    readable.pipe(es.split('---\n'))
      .on('data', data => {
        if (data.trim())
          records.push(JSON.parse(data));
      })
      .on('end', () => { resolve(records); });
  });
}

function put(records, writable) {
  return new Promise((resolve, reject) => {
    records.forEach(r => {
      writable.write('---\n');
      writable.write(JSON.stringify(r, null, 2));
      writable.write('\n');
    });
    writable.end();
    writable.on('finish', resolve);
    writable.on('error', reject);
  });
}

exports.get = get
exports.put = put
