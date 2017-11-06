const config = require('../../lib/config.js');
const path = require('path');

function spec(name) {
  return path.join(config.resourcesPath, 'specs', name);
}

module.exports = {
  name: "Experiments V1.0",
  list: [
    /*{ name: "ConcurrentSkipListMap - Weak atomicity in clear method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["clear"],
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollFirstEntry method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollFirstEntry"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollLastEntry method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollLastEntry"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in containsValue method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["containsValue"],
        invocations: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in entrySet method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["entrySet"],
        invocations: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in size method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["size"],
        invocations: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in tailMap method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["tailMap"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in toString method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["toString"],
        invocations: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in values method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["values"],
        invocations: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in clear+pollLastEntry method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["clear","pollLastEntry"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollFirstEntry+pollLastEntry method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollFirstEntry","pollLastEntry"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },*/
    { name: "ConcurrentSkipListMap - Weak atomicity in size+toString method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["size","toString"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollFirstEntry+toString method",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollFirstEntry","toString"],
        invocations: 5,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    }
  ]
}
