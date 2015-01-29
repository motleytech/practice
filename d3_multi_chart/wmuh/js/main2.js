// HELPERS

function getMaxElements1(d) {
  var nels = [];

  for (var i=0; i < d.length; i++) {
    nels.push(d[i].data.length);
  }

  return _.max(nels);
}

function getMaxElements2(d) {
  return d.data.length;
}


function getBounds1(d, paddingFactor) {
  var b = {};
  for (var i=0; i < d.length; i++) {
    b[i] = getBounds(d[i], paddingFactor);
  }
  return b;
}

function getBounds2(d, paddingFactor) {
  var b = {};
  b[0] = getBounds(d, paddingFactor);;
  return b;
}

function getBounds(d, paddingFactor) {
  paddingFactor = typeof paddingFactor !== 'undefined' ? paddingFactor : 1;

  var b = {};
  var values = _.map(d.data, function(t) { return t.time; });

  b.max = _.max(values);
  b.min = _.min(values);

  var diff = b.max - b.min;
  b.max += diff * (paddingFactor - 1);
  b.min -= diff * (paddingFactor - 1);

  return b;
}


function addDiv(container, newid) {
    var objTo = document.getElementById(container)
    var newdiv = document.createElement("div");
    newdiv.setAttribute('id', newid);
    objTo.appendChild(newdiv);
};

function getter1(data, cg, item, attr) {
  var ds = data[cg];
  if (ds === undefined) {
    return undefined;
  }
  return getter2(ds, cg, item, attr);
};

function getter2(data, cg, item, attr) {
  var ditem = data.data[item];
  if (ditem === undefined) {
    return undefined;
  }
  return ditem[attr];
};

d3.json('data/summary3.json', function(data) {
  var options = {
    "build_menu": false,
    "multi_graph": true,
    "element": "#chart",
    "width": 800,
    "height": 300,
    "getter": getter1,
    "suffix": '',
    "xlabelx": 400,
    "xlabely": 280,
    "getMaxEls": getMaxElements1,
    "getBounds": getBounds1,
    "translatex": 50,
    "radius": 12,
    "show_time": true,
    "show_info": true
  };
  var zoom_graph = makeChart(data, options);

  for (var ix=0; ix<data.length; ix++) {
    // add a div to chart list
    var divname = "chart-" + ix;
    addDiv("chart-list", divname);
    //
    var options2 = {
      "build_menu": false,
      "multi_graph": false,
      "element": ("#" + divname),
      "width": 300,
      "height": 100,
      "getter": getter2,
      "suffix": ("" + ix),
      "xlabelx": 200,
      "xlabely": 130,
      "getMaxEls": getMaxElements2,
      "getBounds": getBounds2,
      "translatex": 20,
      "radius": 5,
      "show_time": false,
      "show_info": false,
      "link_to_multi_graph": zoom_graph,
      "graph_num": ix
    };

    makeChart(data[ix], options2);
  }
});

var makeChart = function (data, options) {
  var xAxis = 'Timeline';
  var currentGraph = 0;
  var maxElements = options.getMaxEls(data);

  var bounds = options.getBounds(data, 1.02);

  // SVG AND D3 STUFF
  var svg = d3.select(options.element)
    .append("svg")
    .attr("width", options.width)
    .attr("height", options.height);
  var xScale, yScale;

  if (options.link_to_multi_graph !== undefined) {
    svg.on('click', function (d) { options.link_to_multi_graph['show_graph'](options.graph_num); });
  }

  svg.append('g')
    .classed('chart' + options.suffix, true)
    .attr('transform', 'translate(' + options.translatex + ', 0)');

  // Build menus
  if (options.build_menu) {
    var xAxisOptions;
    if (options.multi_graph) {
      xAxisOptions = []
      for (var ix=0; ix < data.length; ix++) {
        xAxisOptions.push("Graph " + (ix + 1));
      }
    }
    d3.select('#x-axis-menu')
      .selectAll('li')
      .data(xAxisOptions)
      .enter()
      .append('li')
      .text(function(d) {return d;})
      .classed('selected', function(d) {
        return d === ("Graph " + (currentGraph + 1));
      })
      .on('click', function(d) {
        show_graph(parseInt(d.split(" ")[1]) - 1);
      });
  }

  function show_graph(gnum) {
    currentGraph = gnum;
    updateChart();
    updateMenus();
  };

  // Point info
  if (options.show_info) {
    d3.select('svg g.chart' + options.suffix)
      .append('text')
      .attr({'id': 'pointInfo', 'x': 10, 'y': 60, 'text-anchor': 'left'})
      .style({'font-size': '20px', 'font-weight': 'bold', 'fill': '#555'});
  }

  // background line (to appear behind points)
  d3.select('svg g.chart' + options.suffix)
    .append('line')
    .attr('id', 'backline' + options.suffix);

  // X Axis label
  if (options.show_time) {
    d3.select('svg g.chart' + options.suffix)
      .append('text')
      .attr({'id': 'xLabel' + options.suffix, 'x': options.width/2, 'y': options.height - 20, 'text-anchor': 'middle'})
      .text("Review " + currentGraph);
  }

  // Render points
  updateScales();
  var pointColour = d3.scale.category20b();
  var placeholderArray = Array(maxElements);
  for (var ix=0; ix < placeholderArray.length; ix++) {
    placeholderArray[ix] = ix;
  }

  var circles = d3.select('svg g.chart' + options.suffix)
        .selectAll('circle')
        .data(placeholderArray)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
          res = options.getter(data, currentGraph, d, 'time');
          return (res === undefined) ? d3.select(this).attr('cx') : xScale(res);
        })
        .attr('cy', function(d) {
          return yScale(0);
        })
        .attr('fill', function(d, i) {return pointColour(i);});


  if (options.show_info) {
    circles.style('cursor', 'pointer')
      .on('mouseover', function(d) {
        var dtext = "Info: " + options.getter(data, currentGraph, d, 'text') + " (" + options.getter(data, currentGraph, d, 'time') + ")";
        d3.select('svg g.chart' + options.suffix + ' #pointInfo')
          .text(dtext)
          .transition()
          .style('opacity', 1);
      })
      .on('mouseout', function(d) {
        d3.select('svg g.chart' + options.suffix + ' #pointInfo')
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

  updateChart(true);
  updateMenus();

  // Render axes
  if (options.show_time) {
    d3.select('svg g.chart' + options.suffix)
      .append("g")
      .attr('transform', 'translate(0, ' + (options.height*0.85 - 20) + ')')
      .attr('id', 'xAxis' + options.suffix)
      .call(makeXAxis);
  }

  //// RENDERING FUNCTIONS
  function updateChart(init) {
    updateScales();

    d3.select('svg g.chart' + options.suffix)
      .selectAll('circle')
      .transition()
      .duration(400)
      .ease('quad-out')
      .attr('cx', function(d) {
        res = options.getter(data, currentGraph, d, 'time');
        return (res === undefined) ? d3.select(this).attr('cx') : xScale(res);
      })
      .attr('cy', function(d) {
        return yScale(0);
      })
      .attr('r', function(d) {
        res = options.getter(data, currentGraph, d, 'time');
        return (res === undefined) ? 0 : options.radius;
      });

    // Also update the axes
    if (options.show_time) {
      d3.select('#xAxis' + options.suffix)
        .transition()
        .call(makeXAxis);

      d3.select('#xLabel' + options.suffix)
        .text(xAxis);
    }

    // Update back line
    var mxx, mnx;
    mxx = bounds[currentGraph].max;
    mnx = bounds[currentGraph].min;

    // Fade in
    d3.select('#backline' + options.suffix)
      .style('opacity', 0)
      .attr({'x1': xScale(mnx), 'y1': yScale(0), 'x2': xScale(mxx), 'y2': yScale(0)})
      .transition()
      .duration(500)
      .style('opacity', 1);
  }

  function updateScales() {
    xScale = d3.scale.linear()
                    .domain([bounds[currentGraph].min, bounds[currentGraph].max])
                    .range([20, options.width - 70]);  // TODO: fix these numbers

    yScale = d3.scale.linear()
                    .domain([-10, 10])
                    .range([options.height - 20, 40]);  // TODO: fix these numbers
  }

  function makeXAxis(s) {
    s.call(d3.svg.axis()
      .scale(xScale)
      .orient("bottom"));
  }

  function updateMenus() {
    if (options.build_menu) {
      d3.select('#x-axis-menu')
        .selectAll('li')
        .classed('selected', function(d) {
          return d === ("Graph " + (currentGraph + 1));
        });
    };
  }

  return {
    'show_graph': show_graph
  }

};


