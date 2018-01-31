
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

function coin(p) {
  return Math.random() < p;
}

class Plot {
  constructor(parent) {
    this.data = [];
    this.margin = {};
    this.margin.top = this.getTopMargin();
    this.margin.bottom = this.getBottomMargin();
    this.margin.left = this.getLeftMargin();
    this.margin.right = this.getRightMargin();
    this.width = this.getWidth() - this.margin.left - this.margin.right;
    this.height = this.getHeight() - this.margin.top - this.margin.bottom;
    this.scale = {};
    this.scale.x = this.getScaleX().range([0, this.width]);
    this.scale.y = this.getScaleY().range([this.height, 0]);
    this.axis = {};
    this.axis.x = this.getAxisX();
    this.axis.y = this.getAxisY();
    this.palette = this.getPalette();

    this.svg = parent.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    let title = this.svg.append("g")
        .attr("transform", `translate(${this.width / 2},0)`)
      .append("text")
        .attr("class", "label")
        .text(this.getName());

    let xAxis = this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")");
    xAxis.append("g")
        .attr("class", "x axis");
    xAxis.append("text")
        .attr("class", "label")
        .attr("x", this.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(this.getAxisLabelX());

    let yAxis = this.svg.append("g");
    yAxis.append("g")
        .attr("class", "y axis")
    yAxis.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", "16")
        .style("text-anchor", "end")
        .text(this.getAxisLabelY());

    // let legend = svg.selectAll(".legend")
    //     .data(palette.domain())
    //   .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    //
    // legend.append("rect")
    //   .attr("x", width - 18)
    //   .attr("width", 18)
    //   .attr("height", 18)
    //   .style("fill", palette);
    //
    // legend.append("text")
    //   .attr("x", width - 24)
    //   .attr("y", 9)
    //   .attr("dy", ".35em")
    //   .style("text-anchor", "end");
    //   // .text(d => d % 2 === 0 ? 'base' : 'jit')

  }

  getName() {
    return undefined;
  }

  getWidth() {
    return 400;
  }

  getHeight() {
    return 300;
  }

  getTopMargin() {
    return 20;
  }

  getRightMargin() {
    return 20;
  }

  getBottomMargin() {
    return 30;
  }

  getLeftMargin() {
    return 40;
  }

  getPalette() {
    return d3.scaleOrdinal(d3.schemeCategory10);
  }

  getFillColor(datum) {
    return this.palette(this.getFillColorIndex(datum));
  }

  getFillColorIndex(datum) {
    return datum.color;
  }

  getPositionX(datum) {
    return this.scale.x(this.getCoordinateX(datum));
  }

  getPositionY(datum) {
    return this.scale.y(this.getCoordinateY(datum));
  }

  getCoordinateX(datum) {
    return datum.x;
  }

  getCoordinateY(datum) {
    return datum.y;
  }

  getRadius(datum) {
    return datum.radius;
  }

  getScaleX() {
    return d3.scaleLinear();
  }

  getScaleY() {
    return d3.scaleLinear();
  }

  getExtentFactorX(d) {
    return this.getCoordinateX(d);
  }

  getExtentFactorY(d) {
    return this.getCoordinateY(d);
  }

  getAxisX() {
    return d3.axisBottom(this.scale.x);
  }

  getAxisY() {
    return d3.axisLeft(this.scale.y);
  }

  getAxisLabelX() {
    return 'X';
  }

  getAxisLabelY() {
    return 'Y';
  }

  addData(data) {
    this.processData(data);
    this.refresh();
  }

  processData(data) {

  }

  refresh() {
    this.scale.x.domain(d3.extent(this.data, d => this.getExtentFactorX(d)));
    this.scale.y.domain(d3.extent(this.data, d => this.getExtentFactorY(d)));
    this.axis.x = this.getAxisX();
    this.axis.y = this.getAxisY();

    this.svg.selectAll('.x.axis').call(this.axis.x);
    this.svg.selectAll('.y.axis').call(this.axis.y);

    this.svg.selectAll(".point").data(this.data)
      .enter().append("circle")
        .attr("class", "point")
        .attr("r", d => this.getRadius(d))
        .attr("cx", d => this.getPositionX(d))
        .attr("cy", d => this.getPositionY(d))
        .style("fill", d => this.getFillColor(d));
  }
}

class TimeVsOperationsPlot extends Plot {
  constructor(parent) {
    super(parent);
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getAxisLabelX() {
    return 'Operations';
  }

  getAxisLabelY() {
    return 'Time (ms)';
  }
}

class WithVsWithoutJitPlot extends Plot {
  constructor(parent) {
    super(parent);
    this.svg.append("line")
        .attr("stroke", "#000")
        .attr("x1", 0)
        .attr("y1", this.height)
        .attr("x2", this.width)
        .attr("y2", 0);
  }

  getName() {
    return 'With vs. Without JIT';
  }

  getExtentFactorX(d) {
    return this.getCoordinateX(d);
  }

  getExtentFactorY(d) {
    return this.getCoordinateX(d);
  }

  getScaleX() {
    return d3.scaleLog();
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getAxisLabelX() {
    return 'With JIT';
  }

  getAxisLabelY() {
    return 'Without JIT';
  }

  processData(data) {
    let jit = data.jit;

    if (!this.temp)
      this.temp = {};

    for (let stat of data.stats) {
      let name = stat.input;

      if (!this.temp[name])
        this.temp[name] = { radius: 3, color: +stat.result };

      if (jit)
        this.temp[name].x = +stat.time;
      else
        this.temp[name].y = +stat.time;
    }

    for (let name of Object.keys(this.temp)) {
      let entry = this.temp[name];
      if (entry.x !== undefined && entry.y !== undefined) {
        delete this.temp[name];

        if (!coin(0.0001))
          continue;
        this.data.push(entry);
      }
    }
  }
}

class LinearizablePlot extends TimeVsOperationsPlot {
  constructor(parent) {
    super(parent);
  }

  getName() {
    return "Linearizable Plot";
  }

  processData(data) {
    for (let stat of data.stats) {
      if (!stat.result)
        continue;

      if (!coin(0.001))
        continue;

      let x = stat.schema.sequences.reduce((sum, seq) => sum + seq.invocations.length, 0);
      let y = stat.time;
      let radius = stat.schema.sequences.length;
      let color = +data.jit;
      this.data.push({ x, y, radius, color });
    }
  }
}

class NonLinearizablePlot extends TimeVsOperationsPlot {
  constructor(parent) {
    super(parent);
  }

  getName() {
    return "Non-Linearizable Plot";
  }

  processData(data) {
    for (let stat of data.stats) {
      if (stat.result)
        continue;

      if (!coin(0.001))
        continue;

      let x = stat.schema.sequences.reduce((sum, seq) => sum + seq.invocations.length, 0);
      let y = stat.time;
      let radius = stat.schema.sequences.length;
      let color = +data.jit;
      this.data.push({ x, y, radius, color });
    }
  }
}


async function visualize(files) {
  let body = d3.select("body");
  let plots = [];

  plots.push(new LinearizablePlot(body));
  plots.push(new NonLinearizablePlot(body));
  // plots.push(new WithVsWithoutJitPlot(body));

  for (let promise of files.map(getData)) {
    let data = await promise;

    console.log(`received data`);

    for (let plot of plots) {
      plot.addData(data);
    }
  }
}
