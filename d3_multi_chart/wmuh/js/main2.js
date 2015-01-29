// HELPERS
function parseData(d) {
  var keys = _.keys(d[0]);
  return _.map(d, function(d) {
    var o = {};
    _.each(keys, function(k) {
      if( k == 'Country' )
        o[k] = d[k];
      else
        o[k] = parseFloat(d[k]);
    });
    return o;
  });
}

function getMaxElements(d) {
  var nels = [];

  for (var i=0; i < d.length; i++) {
    nels.push(d[i].data.length);
  }

  return _.max(nels);
}


function getBounds(d, paddingFactor) {
  // Find min and maxes (for the scales)
  paddingFactor = typeof paddingFactor !== 'undefined' ? paddingFactor : 1;

  var b = {};
  var values;

  for (var i=0; i < d.length; i++) {
    b[i] = {}
    var values = _.map(d[i].data, function(t) { return t.time; });
    b[i].max = _.max(values);
    b[i].min = _.min(values);

    var diff = b[i].max - b[i].min;
    b[i].max += diff * (paddingFactor - 1);
    b[i].min -= diff * (paddingFactor - 1);
  }

  return b;
}

d3.json('data/summary3.json', function(data) {

  var xAxis = 'Timeline', yAxis = '';
  var xAxisOptions = ["Graph 1", "Graph 2", "Graph 3"];
  var currentGraph = 0;
  var maxElements = getMaxElements(data);
  // var yAxisOptions = ["Well-being"];

  //var keys = _.keys(data[0]);
  //var data = parseData(data);
  var bounds = getBounds(data, 1.02);

  // SVG AND D3 STUFF
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 300);
  var xScale, yScale;

  svg.append('g')
    .classed('chart', true)
    .attr('transform', 'translate(50, 0)');

  // Build menus
  d3.select('#x-axis-menu')
    .selectAll('li')
    .data(xAxisOptions)
    .enter()
    .append('li')
    .text(function(d) {return d;})
    .classed('selected', function(d) {
      return d === ("Graph " + (currentGraph + 1));  // TODO: fix this selection
    })
    .on('click', function(d) {
      currentGraph = parseInt(d.split(" ")[1]) - 1;  // TODO: fix this one too
      updateChart();
      updateMenus();
    });

  // d3.select('#y-axis-menu')
  //   .selectAll('li')
  //   .data(yAxisOptions)
  //   .enter()
  //   .append('li')
  //   .text(function(d) {return d;})
  //   .classed('selected', function(d) {
  //     return d === yAxis;
  //   })
  //   .on('click', function(d) {
  //     yAxis = d;
  //     updateChart();
  //     updateMenus();
  //   });

  // Review number
  d3.select('svg g.chart')
    .append('text')
    .attr({'id': 'reviewNumber', 'x': 10, 'y': 60, 'text-anchor': 'left'})
    .style({'font-size': '20px', 'font-weight': 'bold', 'fill': '#555'});

  // background line (to appear behind points)
  d3.select('svg g.chart')
    .append('line')
    .attr('id', 'backline');  // TODO: how is this updated?

  // X Axis label
  d3.select('svg g.chart')
    .append('text')
    .attr({'id': 'xLabel', 'x': 400, 'y': 280, 'text-anchor': 'middle'})
    .text("Review " + currentGraph);

  // Y axis label
  //d3.select('svg g.chart')
    //.append('text')
    //.attr('transform', 'translate(-60, 330)rotate(-90)')
    //.attr({'id': 'yLabel', 'text-anchor': 'middle'})
    //.text('Well-being (scale of 0-10)');

  // Render points
  updateScales();
  var pointColour = d3.scale.category20b();
  var placeholderArray = Array(maxElements);
  for (var ix=0; ix < placeholderArray.length; ix++) {
    placeholderArray[ix] = ix;
  }

  d3.select('svg g.chart')
    .selectAll('circle')
    .data(placeholderArray)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      var res = data[currentGraph].data[d];
      return (res === undefined) ? d3.select(this).attr('cx') : xScale(res.time);
    })
    .attr('cy', function(d) {
      return yScale(0);
    })
    .attr('fill', function(d, i) {return pointColour(i);})
    .style('cursor', 'pointer')
    .on('mouseover', function(d) {
      var dtext = "Info: " + data[currentGraph].data[d].text + " (" + data[currentGraph].data[d].time + ")";
      d3.select('svg g.chart #reviewNumber')
        .text(dtext)
        .transition()
        .style('opacity', 1);
    })
    .on('mouseout', function(d) {
      d3.select('svg g.chart #reviewNumber')
        .transition()
        .duration(500)
        .style('opacity', 0);
    });

  updateChart(true);
  updateMenus();

  // Render axes
  d3.select('svg g.chart')
    .append("g")
    .attr('transform', 'translate(0, 240)')
    .attr('id', 'xAxis')
    .call(makeXAxis);

  //d3.select('svg g.chart')
    //.append("g")
    //.attr('id', 'yAxis')
    //.attr('transform', 'translate(0, 0)')
    //.call(makeYAxis);



  //// RENDERING FUNCTIONS
  function updateChart(init) {
    updateScales();

    d3.select('svg g.chart')
      .selectAll('circle')
      .transition()
      .duration(400)
      .ease('quad-out')
      .attr('cx', function(d) {
        var res = data[currentGraph].data[d];
        return (res === undefined) ? d3.select(this).attr('cx') : xScale(res.time);
      })
      .attr('cy', function(d) {
        return yScale(0);
      })
      .attr('r', function(d) {
        var res = data[currentGraph].data[d];
        return (res === undefined) ? 0 : 12;
      });

    // Also update the axes
    d3.select('#xAxis')
      .transition()
      .call(makeXAxis);

    //d3.select('#yAxis')
      //.transition()
      //.call(makeYAxis);

    // Update axis labels
    d3.select('#xLabel')
      .text(xAxis);

    // Update back line
    var mxx, mnx;
    mxx = bounds[currentGraph].max;
    mnx = bounds[currentGraph].min;

    // Fade in
    d3.select('#backline')
      .style('opacity', 0)
      .attr({'x1': xScale(mnx), 'y1': yScale(0), 'x2': xScale(mxx), 'y2': yScale(0)})
      .transition()
      .duration(500)
      .style('opacity', 1);
  }

  function updateScales() {
    xScale = d3.scale.linear()
                    .domain([bounds[currentGraph].min, bounds[currentGraph].max])
                    .range([20, 720]);  // TODO: fix these numbers

    yScale = d3.scale.linear()
                    .domain([-10, 10])
                    .range([240, 40]);  // TODO: fix these numbers
  }

  function makeXAxis(s) {
    s.call(d3.svg.axis()
      .scale(xScale)
      .orient("bottom"));
  }

  //function makeYAxis(s) {
    //s.call(d3.svg.axis()
      //.scale(yScale)
      //.orient("left"));
  //}

  function updateMenus() {
    d3.select('#x-axis-menu')
      .selectAll('li')
      .classed('selected', function(d) {
        return d === ("Graph " + (currentGraph + 1));
      });
    //d3.select('#y-axis-menu')
      //.selectAll('li')
      //.classed('selected', function(d) {
        //return d === yAxis;
    //});
  }

})


