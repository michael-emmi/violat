function position(op) {
  return {
    x1: op.begin * 50 + 100,
    y1: op.sid * 50 + 100,
    x2: op.end * 50 + 100,
    y2: op.sid * 50 + 100
  };
}

function operationLabel(op) {
  return `${op.invocation.method.name}(${op.invocation.arguments.join(',')})${op.value ? `: ${op.value}` : ''}`;
}

function programLabel(schema) {
  return [`program { `,
    ...schema.sequences.map(seq => {
      return '&nbsp;&nbsp;thread { ' + seq.invocations.map(inv => {
        return `${inv.method.name}(${inv.arguments.join(",")})`;
      }).join("; ") + ' }';
    }),
    '}'];
}

function visualize(file) {
  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  d3.json(file, function(error, trace) {
    if (error) throw error;

    let operations = {};
    for (let [idx, event] of trace.events.entries()) {
      let id = event.invocation.id;
      if (operations[id])
        operations[id].end = idx;
      else
        operations[id] = {
          id,
          sid: event.sid,
          begin: idx,
          invocation: event.invocation
        };
      if (event.value !== undefined)
        operations[id].value = event.value;
    }

    let program = svg.append("g")
        .attr("class", "program")
        .attr("transform", `translate(100, ${trace.schema.sequences.length * 50 + 100})`)
        .append("text");

    program.append("tspan")
      .selectAll("tspan")
      .data(programLabel(trace.schema))
      .enter().append("tspan")
        .attr("x", 0)
        .attr("dy", "1.4em")
        .html(seq => seq);

    let ops = svg.append("g")
        .attr("class", "operations")
      .selectAll("g")
      .data(Object.values(operations))
      .enter().append("g")
        .attr("transform", op => `translate(${position(op).x1},${position(op).y1})`);

    let span = ops.append("line")
        .attr("class", "span")
        .attr("x2", op => position(op).x2 - position(op).x1);

    let label = ops.append("text")
      .text(op => operationLabel(op))
      .attr('dy', 20);

    let id = ops.append("text")
      .text(op => `${op.invocation.id}`)
      .attr('dy', -10);

    let left = ops.append("circle");
    let right = ops.append("circle")
        .attr("cx", op => position(op).x2 - position(op).x1);

  });
}
