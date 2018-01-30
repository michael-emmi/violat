
function getData(file) {
  return new Promise((resolve, reject) => {
    d3.json(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data);
      }
    });
  });
}


async function visualize(files) {
  let margin = {top: 20, right: 20, bottom: 30, left: 40};
  let width = 800 - margin.left - margin.right;
  let height = 450 - margin.top - margin.bottom;

  let palette = d3.scaleOrdinal(d3.schemeCategory10);

  let scale = {
    x: d3.scaleLinear().range([0, width]),
    y: d3.scaleLinear().range([height, 0])
  };

  let axes = {
    x: d3.axisBottom(scale.x),
    y: d3.axisLeft(scale.y)
  };

  function coord(stat) {
    return {
      x: stat.operations,
      y: stat.time
    };
  };

  function position(stat) {
    let c = coord(stat);
    return {
      x: scale.x(c.x),
      y: scale.y(c.y)
    };
  };

  function color(stat) {
    let index = (+stat.weak << 0) + (+stat.jit << 1) + (+stat.min << 2);
    return palette(index);
  };

  let stats = [];

  let svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let y = svg.append("g")
      .attr("transform", "translate(0," + height + ")");
  y.append("g")
      .attr("class", "x axis");
  y.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Operations");

  let x = svg.append("g");
  x.append("g")
      .attr("class", "y axis")
  x.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", "16")
      .style("text-anchor", "end")
      .text("Time (ms)");

  let legend = svg.selectAll(".legend")
      .data(palette.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", palette);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d % 2 === 0 ? 'base' : 'jit')

  for (let promise of files.map(getData)) {
    let data = await promise;
    console.log(data);
    data.stats.forEach(s => {
      s.weak = data.weak;
      s.jit = data.jit;
      s.min = data.min;
    })
    stats.push(...data.stats);

    scale.x.domain(d3.extent(stats, stat => coord(stat).x));
    scale.y.domain(d3.extent(stats, stat => coord(stat).y));

    axes = {
      x: d3.axisBottom(scale.x),
      y: d3.axisLeft(scale.y)
    };

    svg.selectAll('.x.axis').call(axes.x);
    svg.selectAll('.y.axis').call(axes.y);

    svg.selectAll(".point").data(stats)
      .enter().append("circle")
        .attr("class", "point")
        .attr("r", 3.5)
        .attr("cx", stat => position(stat).x)
        .attr("cy", stat => position(stat).y)
        .style("fill", color);

  }
}
