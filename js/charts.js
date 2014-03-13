function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      chart.data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      if(!xScale.domain.overridden) xScale.domain(d3.extent(chart.data, function(d) { return d[0]; }));
      xScale.range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(chart.data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([chart.data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter()
        .append("svg")
          .attr("class", "chart time-series")
        .append("g")
          .attr("class", "inner");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xDomain = function(_) {
    if(!arguments.length) return xScale.domain();
    if (_ == "auto") {
      xScale.domain(d3.extent(chart.data, function(d) { return d[0]; }));
      return chart;
    }
    xScale.domain(_);
    xScale.domain.overridden = true;
    return chart;
  };

  return chart;
}

function barChart() {
  var margin = {top: 40, right: 40, bottom: 40, left: 15},
      width = 500,
      height = 600,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.scale.ordinal(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
      yAxis = d3.svg.axis().scale(yScale).orient("right").tickFormat(bbwNumberFormat).ticks(5);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      chart.data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i), d.annotation];
      });

      // Update the x-scale.
      xScale
        .domain(chart.data.map(function(d) { return d[0]; }))
        .rangeRoundBands([0, width-margin.left-margin.right], .1);

      // Update the y-scale.
      if(!yScale.domain.overridden) yScale.domain([0, d3.max(chart.data, function(d) { return d[1]; })])
      yScale.range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([chart.data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter()
        .append("svg")
          .attr("class", "chart bar")
        .append("g")
          .attr("class", "inner");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g.inner")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Create skeleton bars
      var barEnter = g.selectAll(".bar")
          .data(chart.data)
        .enter().append("g")
          .attr("class", "bar")
          .attr("data-x", function(d,i) { return d[0]; })
          .attr("data-y", function(d,i) { return d[1]; })
          .attr("data-annotation", function(d,i) { return d[2]; });
      barEnter.append("rect");
      barEnter.select(function(d,i) { return d[2] ? this : null })
        .append("text")
          .attr("class", "annotation")
          .text(function(d,i) { return d[2]; });

      // Update bars
      var bars = g.selectAll(".bar")
        .transition()
          .attr("transform", function(d) { return "translate("+X(d)+","+yScale(Math.max(0, d[1]))+")"});
      bars.selectAll("rect")
          .attr("width", xScale.rangeBand())
          .attr("height", function(d) { return Math.abs(Y(d) - yScale(0)); });

      // Update the x-axis.
      xAxis.tickValues(d3.extent(chart.data, function(d) { return d[0]; }));
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // Update the y-axis.
      yAxis.tickSize(-(width-margin.left-margin.right),0);
      g.select(".y.axis")
          .attr("transform", "translate(" + (width-margin.left-margin.right) + ",0)")
          .call(yAxis);

    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.yDomain = function(_) {
    if (!arguments.length) return yScale.domain();
    if (_ == "auto") {
      yScale.domain([0, d3.max(chart.data, function(d) { return d[1]; })]);
      return chart;
    }
    yScale.domain(_);
    yScale.domain.overridden = true;
    return chart;
  };

  return chart;

}
