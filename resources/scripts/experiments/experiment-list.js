const config = require('../../../lib/config.js').default;
const path = require('path');

function spec(name) {
  return path.join(config.resourcesPath, 'specs', name);
}

module.exports = {
  name: "Experiments V1.0",
  list: [

// *****   HashMap ********

    { name: "ConcurrentHashMap - Weak behaviors in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["clear"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in contains method (6,shuffle,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["contains"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in containsValue method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["containsValue"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in elements method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["elements"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in entrySet method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["entrySet"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in isEmpty method (6,random,2000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["isEmpty"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "2000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in keySet method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["keySet"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in keys method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["keys"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in mappingCount method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["mappingCount"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["size"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["toString"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in values method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["values"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in contains+contains method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["contains","contains"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in contains+elements method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["contains","elements"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in contains+isEmpty method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["contains","isEmpty"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in isEmpty+elements method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["isEmpty","elements"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in elements+elements method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["elements","elements"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentHashMap - Weak behaviors in isEmpty+isEmpty method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentHashMap.json"),
        methods: ["isEmpty","isEmpty"],
        enum: "random",
        invocations: 6,
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },

// *****   SkipListMap ********

    { name: "ConcurrentSkipListMap - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollFirstEntry method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollFirstEntry"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in pollLastEntry method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["pollLastEntry"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in containsValue method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["containsValue"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in entrySet method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["entrySet"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in tailMap method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["tailMap"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in headMap method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["tailMap"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in values method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["values"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in isEmpty method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["isEmpty"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in containsValue+isEmpty method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["containsValue","isEmpty"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in containsValue+containsValue method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["containsValue","containsValue"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in containsValue+toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["containsValue","toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in isEmpty+isEmpty method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["isEmpty","isEmpty"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in toString+toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["toString","toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListMap - Weak atomicity in isEmpty+toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListMap.json"),
        methods: ["isEmpty","toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },

// *****   SkipListSet ********

    { name: "ConcurrentSkipListSet - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in headSet method (6,random,20000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["headSet"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "20000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in pollFirst method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["pollFirst"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in pollLast method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["pollLast"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in subSet method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["subSet"],
        invocations: 6,
        values: 4,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in tailSet method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["tailSet"],
        invocations: 6,
        values: 3,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in toArray method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["toArray"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentSkipListSet - Weak atomicity in toString method (6,random,20000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentSkipListSet.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "20000"
      }
    },

// *****   ConcurrentLinkedQueue ********

    { name: "ConcurrentLinkedQueue - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedQueue - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedQueue - Weak atomicity in toArray method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["toArray"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedQueue - Weak atomicity in toString method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedQueue - Weak atomicity in toArray+toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["toArray","toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },
    { name: "ConcurrentLinkedQueue - Weak atomicity in toArray+size method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedQueue.json"),
        methods: ["toArray","size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },

// *****   LinkedTransferQueue ********

    { name: "LinkedTransferQueue - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedTransferQueue - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedTransferQueue - Weak atomicity in toArray method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["toArray"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedTransferQueue - Weak atomicity in toString method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedTransferQueue - Weak atomicity in toArray+toString method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["toArray","toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },

    { name: "LinkedTransferQueue - Weak atomicity in toArray+size method (6,random,10000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedTransferQueue.json"),
        methods: ["toArray","size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "10000"
      }
    },

// *****   LinkedBlockingQueue ********

    { name: "LinkedBlockingQueue - Weak atomicity in peek method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["peek"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in contains method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["contains"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in isEmpty method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["isEmpty"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in remainingCapacity method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["remainingCapacity"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in remove method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["remove"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in toArray method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["toArray"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "LinkedBlockingQueue - Weak atomicity in toString method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/LinkedBlockingQueue.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },

// *****   ConcurrentLinkedDeque ********

    { name: "ConcurrentLinkedDeque - Weak atomicity in addFirst method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["addFirst"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in clear method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["clear"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in getLast method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["getLast"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in offerFirst method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["offerFirst"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in peekLast method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["peekLast"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in pollLast method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["pollLast"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in removeLastOccurrence method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["removeLastOccurrence"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in removeFirstOccurrence method (6,random,15000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["removeFirstOccurrence"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "15000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in removeLast method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["removeLast"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in size method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["size"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in toArray method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["toArray"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },
    { name: "ConcurrentLinkedDeque - Weak atomicity in toString method (6,random,5000)",
      parameters: {
        spec: spec("java/util/concurrent/ConcurrentLinkedDeque.json"),
        methods: ["toString"],
        invocations: 6,
        enum: "random",
        weak: true,
        weakRelaxLinearization: true,
        weakRelaxVisibility: true,
        weakRelaxReturns: true,
        cutoff: "5000"
      }
    },


  ]
}
