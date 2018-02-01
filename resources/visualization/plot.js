
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
        .style("text-anchor", "middle")
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
        .attr("y", "12")
        .style("text-anchor", "end")
        .text(this.getAxisLabelY());
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

  getDomainX() {
    return d3.extent(this.data, d => this.getCoordinateX(d));
  }

  getDomainY() {
    return d3.extent(this.data, d => this.getCoordinateY(d));
  }

  getAxisX() {
    return d3.axisBottom(this.scale.x).ticks(4);
  }

  getAxisY() {
    return d3.axisLeft(this.scale.y).ticks(4);
  }

  getAxisLabelX() {
    return 'X';
  }

  getAxisLabelY() {
    return 'Y';
  }

  getLegendLabel(colorIndex) {
    return "?";
  }

  addData(...chunks) {
    for (let chunk of chunks)
      this.processData(chunk);
    this.refresh();
  }

  processData(data) {

  }

  refresh() {
    this.scale.x.domain(this.getDomainX());
    this.scale.y.domain(this.getDomainY());
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

    let legend = this.svg.selectAll(".legend")
        .data(this.palette.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (_,i) => `translate(${this.width},${i*20+this.height/2})`);

    legend.append("circle")
      .attr("r", 6)
      .style("fill", this.palette);

    legend.append("text")
      .attr("x", -10)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => this.getLegendLabel(d));
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

class DuelingPlot extends Plot {
  constructor(parent) {
    super(parent);
    this.svg.append("line")
        .attr("stroke", "#000")
        .attr("x1", 0)
        .attr("y1", this.height)
        .attr("x2", this.width)
        .attr("y2", 0);
  }

  getDomain() {
    let [x0,x1] = d3.extent(this.data, d => this.getCoordinateX(d));
    let [y0,y1] = d3.extent(this.data, d => this.getCoordinateY(d));
    return [Math.min(x0,y0), Math.max(x1,y1)];
  }

  getDomainX() {
    return this.getDomain();
  }

  getDomainY() {
    return this.getDomain();
  }

}

class WithVsWithoutJitPlot extends DuelingPlot {
  constructor(parent) {
    super(parent);
  }

  // getName() {
  //   return 'With vs. Without JIT';
  // }

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "Linearizable";
      case 1:
        return "Non-Linearizable";
      case 2:
        return "Unknown";
      default:
        return "???";
    }
  }

  getScaleX() {
    return d3.scaleLog();
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getAxisLabelX() {
    return 'Just-in-Time Linearizability';
  }

  getAxisLabelY() {
    return 'Linearizability';
  }

  processData(data) {
    if (data.weak)
      return;

    let jit = data.jit;

    if (!this.temp)
      this.temp = {};

    for (let stat of data.stats) {
      let name = stat.input;

      if (!this.temp[name])
        this.temp[name] = { radius: 3 };

      if (jit) {
        this.temp[name].x = +stat.time;
        this.temp[name].jit = stat.result;
      } else {
        this.temp[name].y = +stat.time;
        this.temp[name].lin = stat.result;
      }
    }

    for (let name of Object.keys(this.temp)) {
      let entry = this.temp[name];
      if (entry.x !== undefined && entry.y !== undefined) {
        delete this.temp[name];

        // if (!coin(0.01))
        //   continue;
        entry.color = this._colorEntry(entry);
        this.data.push(entry);
      }
    }
  }

  _colorEntry(entry) {
    if (entry.lin || entry.jit)
      return 0;
    else if (entry.lin === false || entry.jit === false)
      return 1;
    else
      return 2;
  }
}

class LinVsWeakPlot extends DuelingPlot {
  constructor(parent) {
    super(parent);
  }

  // getName() {
  //   return 'Linearizability vs. Weak Consistency';
  // }

  getScaleX() {
    return d3.scaleLog();
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "Linearizable";
      case 1:
        return "Weakly Consistent";
      case 2:
        return "Inconsistent";
      case 3:
        return "Unknown";
      default:
        return "???";
    }
  }

  getAxisLabelX() {
    return 'Linearizability';
  }

  getAxisLabelY() {
    return 'Weak Consistency';
  }

  processData(data) {
    if (data.jit)
      return;

    if (data.min)
      return;

    let weak = data.weak;

    if (!this.temp)
      this.temp = {};

    for (let stat of data.stats) {
      let name = stat.input;

      if (!this.temp[name])
        this.temp[name] = { radius: 3 };

      if (!weak) {
        this.temp[name].x = +stat.time;
        this.temp[name].lin = stat.result;
      } else {
        this.temp[name].y = +stat.time;
        this.temp[name].con = stat.result;
      }
    }

    this.emitData(this.temp);
  }

  emitData(temp) {
    for (let name of Object.keys(temp)) {
      let entry = temp[name];
      if (entry.x !== undefined && entry.y !== undefined) {
        entry.color = this._colorEntry(entry);
        delete temp[name];
        // if (!coin(0.01))
        //   continue;
        this.data.push(entry);
      }
    }
  }

  _colorEntry(entry) {
    if (entry.lin)
      return 0;
    else if (entry.con)
      return 1;
    else if (entry.con === false)
      return 2;
    else
      return 3;
  }
}

class WithVsWithoutMinPlot extends DuelingPlot {
  constructor(parent) {
    super(parent);
  }

  // getName() {
  //   return 'With vs. Without Min';
  // }

  getScaleX() {
    return d3.scaleLog();
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "Consistent";
      case 1:
        return "Inconsistent";
      case 2:
        return "Unknown";
      default:
        return "???";
    }
  }

  getAxisLabelX() {
    return 'Min-Visibility Weak Consistency';
  }

  getAxisLabelY() {
    return 'Weak Consistency';
  }

  processData(data) {
    if (!data.weak)
      return;

    let min = data.min;

    if (!this.temp)
      this.temp = {};

    for (let stat of data.stats) {
      let name = stat.input;

      if (!this.temp[name])
        this.temp[name] = { radius: 3 };

      if (min) {
        this.temp[name].x = +stat.time;
        this.temp[name].minRes = stat.result;
      } else {
        this.temp[name].y = +stat.time;
        this.temp[name].woResult = stat.result;
      }
    }

    this.emitData(this.temp);
  }

  emitData(temp) {
    for (let name of Object.keys(temp)) {
      let entry = temp[name];
      if (entry.x !== undefined && entry.y !== undefined) {
        delete temp[name];
        entry.color = this._colorEntry(entry);
        this.data.push(entry);
      }
    }
  }

  _colorEntry(entry) {
    if (entry.minRes || entry.woRes)
      return 0;
    else if (entry.minRes === false)
      return 1;
    else if (entry.woRes === false)
      return 1;
    else
      return 2;
  }

}

class LinVsMinWeakPlot extends DuelingPlot {
  constructor(parent) {
    super(parent);
  }

  // getName() {
  //   return 'Linearizability vs. Weak Consistency';
  // }

  getScaleX() {
    return d3.scaleLog();
  }

  getScaleY() {
    return d3.scaleLog();
  }

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "Linearizable";
      case 1:
        return "Weakly Consistent";
      case 2:
        return "Inconsistent";
      case 3:
        return "Unknown";
      default:
        return "???";
    }
  }

  getAxisLabelX() {
    return 'Linearizability';
  }

  getAxisLabelY() {
    return 'Min-Visibility Weak Consistency';
  }

  processData(data) {
    if (data.jit)
      return;

    if (data.weak && !data.min)
      return;

    let weak = data.weak;

    if (!this.temp)
      this.temp = {};

    for (let stat of data.stats) {
      let name = stat.input;

      if (!this.temp[name])
        this.temp[name] = { radius: 3 };

      if (!weak) {
        this.temp[name].x = +stat.time;
        this.temp[name].lin = stat.result;
      } else {
        this.temp[name].y = +stat.time;
        this.temp[name].con = stat.result;
      }
    }

    this.emitData(this.temp);
  }

  emitData(temp) {
    for (let name of Object.keys(temp)) {
      let entry = temp[name];
      if (entry.x !== undefined && entry.y !== undefined) {
        entry.color = this._colorEntry(entry);
        delete temp[name];
        // if (!coin(0.01))
        //   continue;
        this.data.push(entry);
      }
    }
  }

  _colorEntry(entry) {
    if (entry.lin)
      return 0;
    else if (entry.con)
      return 1;
    else if (entry.con === false)
      return 2;
    else
      return 3;
  }
}


// class TimeVsOpsBoxPlot extends TimeVsOperationsPlot {
//   constructor(parent) {
//     super(parent);
//   }
//
//   processData(data) {
//     if (!this.boxes)
//       this.boxData = {};
//
//     for (let stat of data.stats) {
//       let ops = stat.schema.sequences.reduce((sum, seq) => sum + seq.invocations.length, 0);
//
//       if (!this.boxData[key])
//         this.boxData[key] = [];
//
//       this.boxData[key].push({
//
//       });
//     }
//   }
// }

class LinearizablePlot extends TimeVsOperationsPlot {
  constructor(parent) {
    super(parent);
  }

  getName() {
    return "Linearizable Plot";
  }

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "base";
      case 1:
        return "jit";
      default:
        return "???";
    }
  }

  processData(data) {
    for (let stat of data.stats) {
      if (!stat.result)
        continue;

      if (!coin(0.01))
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

  getLegendLabel(colorIndex) {
    switch (colorIndex) {
      case 0:
        return "base";
      case 1:
        return "jit";
      default:
        return "???";
    }
  }

  processData(data) {
    for (let stat of data.stats) {
      if (stat.result)
        continue;

      if (!coin(0.1))
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

  // plots.push(new LinearizablePlot(body));
  // plots.push(new NonLinearizablePlot(body));
  plots.push(new WithVsWithoutJitPlot(body));
  plots.push(new LinVsWeakPlot(body));
  plots.push(new WithVsWithoutMinPlot(body));
  plots.push(new LinVsMinWeakPlot(body));

  let allData = await Promise.all(files.map(getData));
  console.log(`read all data`);
  for (let plot of plots)
    plot.addData(...allData);
}
