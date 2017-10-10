module.exports = {
  name: "Experiments V1.0",
  list: [
    { name: "Bug in addFirst method",
      parameters: {
        spec: "resources/specs/java/util/concurrent/ConcurrentLinkedDeque.json",
        methods: ["addFirst"],
        enum: "random",
        cutoff: "100"
      }
    }
  ]
}
