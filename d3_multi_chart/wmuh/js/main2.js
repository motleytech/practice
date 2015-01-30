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

function getter1(data, item, attr) {
  return getter2(data, item, attr);
};

function getter2(data, item, attr) {
  var ditem = data.data[item];
  if (ditem === undefined) {
    return undefined;
  }
  return ditem[attr];
};

function get_info_text(data, ix, options) {
  return "Info: " + options.getter(data, ix, 'text') + " (" + options.getter(data, ix, 'time') + ")"
}


d3.json('data/summary3.json', function(input_data) {

  function show_data_zoom(ident) {
    new_data = input_data[ident];
    zoom_graph.show_graph(new_data);
  }

  var options = {
    "build_menu": false,
    "multi_graph": true,
    "element": "#chart",
    "width": 800,
    "height": 250,
    "getter": getter1,
    "id_suffix": '',
    "max_points": 20,
    "getBounds": getBounds,
    "get_info_text": get_info_text,
    "translatex": 20,
    "radius": 12,
    "show_xaxis": true,
    "show_info": true,
    "line_width": "2px",
    "ident": 0
  };
  var zoom_graph = makeChart(input_data[0], options);

  for (var ix=0; ix<input_data.length; ix++) {
    // add a div to chart list
    var divname = "chart-" + ix;
    addDiv("chart-list", divname);
    //
    var options2 = {
      "build_menu": false,
      "multi_graph": false,
      "element": ("#" + divname),
      "width": 200,
      "height": 20,
      "getter": getter2,
      "id_suffix": ("" + ix),
      "max_points": 20,
      "getBounds": getBounds,
      "translatex": 10,
      "radius": 4,
      "show_xaxis": false,
      "show_info": false,
      "callback_on_click": show_data_zoom,
      "graph_num": ix,
      "line_width": "1px",
      "ident": ix
    };

    makeChart(input_data[ix], options2);
  }
});

var makeChart = function (data, options) {
  var xAxis = 'Timeline';
  var maxElements = options.max_points;

  var bounds = options.getBounds(data, 1.0);

  // SVG AND D3 STUFF
  var svg = d3.select(options.element)
    .append("svg")
    .attr("width", options.width)
    .attr("height", options.height);

  var xScale, yScale;

  if (options.callback_on_click !== undefined) {
    svg.on('click', function (d) { options.callback_on_click(options.ident); });
  }

  svg.append('g')
    .classed('chart' + options.id_suffix, true)
    .attr('transform', 'translate(' + options.translatex + ', 0)');

  function show_graph(new_data) {
    data = new_data;
    updateChart();
  };

  // Point info
  if (options.show_info) {
    d3.select('svg g.chart' + options.id_suffix)
      .append('text')
      .attr({'id': 'pointInfo' + options.id_suffix, 'x': 10, 'y': 60, 'text-anchor': 'left'})
      .style({'font-size': '20px', 'font-weight': 'bold', 'fill': '#555'});
  }

  // background line (to appear behind points)
  d3.select('svg g.chart' + options.id_suffix)
    .append('line')
    .attr('id', 'backline' + options.id_suffix);

  // X Axis label
  if (options.show_xaxis) {
    d3.select('svg g.chart' + options.id_suffix)
      .append('text')
      .attr({'id': 'xLabel' + options.id_suffix, 'x': options.width/2, 'y': options.height - 20, 'text-anchor': 'middle'})
      .text("Timeline");
  }

  function updateScales() {
    xScale = d3.scale.linear()
                    .domain([bounds.min, bounds.max])
                    .range([0, options.width - 2*options.translatex]);  // TODO: fix these numbers

    yScale = d3.scale.linear()
                    .domain([-10, 10])
                    .range([options.height, 0]);  // TODO: fix these numbers
  }

  // Render points
  updateScales();

  var pointColour = d3.scale.category20b();
  var placeholderArray = Array(maxElements);

  for (var ix=0; ix < placeholderArray.length; ix++) {
    placeholderArray[ix] = ix;
  }

  var circles = d3.select('svg g.chart' + options.id_suffix)
        .selectAll('circle')
        .data(placeholderArray)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
          res = options.getter(data, d, 'time');
          return (res === undefined) ? d3.select(this).attr('cx') : xScale(res);
        })
        .attr('cy', function(d) {
          return yScale(0);
        })
        .attr('fill', function(d, i) {return pointColour(i);});


  if (options.show_info) {
    circles.style('cursor', 'pointer')
      .on('mouseover', function(d) {
        var dtext = options.get_info_text(data, d, options);
        d3.select('svg g.chart' + options.id_suffix + ' #pointInfo' + options.id_suffix)
          .text(dtext)
          .transition()
          .style('opacity', 1);
      })
      .on('mouseout', function(d) {
        d3.select('svg g.chart' + options.id_suffix + ' #pointInfo' + options.id_suffix)
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

  function makeXAxis(s) {
    s.call(d3.svg.axis()
      .scale(xScale)
      .orient("bottom"));
  }

  // Render axes
  if (options.show_xaxis) {
    d3.select('svg g.chart' + options.id_suffix)
      .append("g")
      .attr('transform', 'translate(0, ' + (options.height - 50) + ')')
      .attr('id', 'xAxis' + options.id_suffix)
      .call(makeXAxis);
  }

  //// RENDERING FUNCTIONS
  function updateChart(init) {
    if (!init) {
      bounds = options.getBounds(data, 1.0);
      updateScales();
    }

    d3.select('svg g.chart' + options.id_suffix)
      .selectAll('circle')
      .transition()
      .duration(400)
      .ease('quad-out')
      .attr('cx', function(d) {
        res = options.getter(data, d, 'time');
        return (res === undefined) ? d3.select(this).attr('cx') : xScale(res);
      })
      .attr('cy', function(d) {
        return yScale(0);
      })
      .attr('r', function(d) {
        res = options.getter(data, d, 'time');
        return (res === undefined) ? 0 : options.radius;
      })
      .attr('fill', function(d, i) { return pointColour(i); });

    // Also update the axes
    if (options.show_xaxis) {
      d3.select('#xAxis' + options.id_suffix)
        .transition()
        .call(makeXAxis);

      d3.select('#xLabel' + options.id_suffix)
        .text(xAxis);
    }

    // Update back line
    var mxx, mnx;
    mxx = bounds.max;
    mnx = bounds.min;

    // Fade in
    d3.select('#backline' + options.id_suffix)
      .style('opacity', 0)
      .attr({'x1': xScale(mnx), 'y1': yScale(0), 'x2': xScale(mxx), 'y2': yScale(0)})
      .transition()
      .duration(500)
      .style('opacity', 1)
      .style('stroke-width', options.line_width);
  }

  updateChart(true);
  return { 'show_graph': show_graph };
};


