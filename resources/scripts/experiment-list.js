const config = require('../../lib/config.js');
const path = require('path');

function spec(name) {
  return path.join(config.resourcesPath, 'specs', name);
}

module.exports = {
  name: "Experiments V1.0",
  list: [
    { name: "Atomicity bug in addFirst method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["addFirst"],
        enum: "random",
        cutoff: "100"
      }
    },
    { name: "Weak behaviors in addFirst method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["addFirst"],
        enum: "random",
        weak: true,
        cutoff: "100"
      }
    }
  ]
}
