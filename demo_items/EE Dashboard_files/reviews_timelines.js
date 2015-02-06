chartLib = function() {

  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style('stroke', "#000")
    .style('font', "16px sans-serif")
    .style('background', "lightsteelblue")
    .style('width','120px')
    .text("a simple tooltip");

  function getBounds(d, paddingFactor) {
    paddingFactor = paddingFactor !== 'undefined' ? paddingFactor : 1;

    var b = {};
    var values = _.map(d, function (t) {
      return t.time_distance;
    });

    b.max = _.max(values);
    b.min = _.min(values);

    var diff = b.max - b.min;
    b.max += diff * (paddingFactor - 1);
    b.min -= diff * (paddingFactor - 1);

    return b;
  };

  function getAttr(data, item, attr) {
    var ditem = data[item];
    if (ditem === undefined) {
      return undefined;
    }
    return ditem[attr];
  };

  function getPointColor(event){
    var eventsColors = {};
    eventsColors["EVENT_PUBLISH"] = "#393B79";
    eventsColors["EVENT_UPDATE"]= "#6B6ECF";
    eventsColors["EVENT_COMMENT"] = "#F0AD4E";
    eventsColors["EVENT_ISSUE"] = "#843C39";
    eventsColors["EVENT_SHIPIT"] = "#5CB85C";
    eventsColors["EVENT_MERGE"] = "#637939";
    return eventsColors[event];
  }

  function getPointLabel(event){
    var eventsLabels = {};
    eventsLabels["EVENT_PUBLISH"] = "P";
    eventsLabels["EVENT_UPDATE"]= "U";
    eventsLabels["EVENT_COMMENT"] = "C";
    eventsLabels["EVENT_ISSUE"] = "I";
    eventsLabels["EVENT_SHIPIT"] = "S";
    eventsLabels["EVENT_MERGE"] = "M";
    return eventsLabels[event];
  }

  function get_info_text(data, ix, options) {
    return options.getter(data, ix, 'event_description');
    //return "Info: " + options.getter(data, ix, 'event') + " (" + options.getter(data, ix, 'time_distance') + ")"
  };

  function eventOver(data, d, options, self){

    var dtext = options.get_info_text(data, d, options);
    tooltip.style("visibility", "visible")
      .text(dtext);


    //d3.select(self)
    //  .style('stroke', "#000")
    //  .style('stroke-width', "2px");
    //var tooltext = options.get_info_text(data, d, options);
    //tooltip.text(tooltext)
    //       .style("visibility", "visible");

  };

  function startingFunctionSmall(timeline_data, divname, suffix, review_data, callback, extra_options) {

    var options = {
      "build_menu": false,
      "multi_graph": false,
      "element": ("#" + divname),
      "width": 400,
      "height": 30,
      "getter": getAttr,
      "id_suffix": ("" + suffix),
      "max_points": 20,
      "getBounds": getBounds,
      "translatex": 10,
      "radius": 10,
      "show_xaxis": false,
      "show_info": true,
      "callback_on_click": callback,
      "graph_num": 0,
      "tick_width": 5,
      "tick_height": 24,
      "line_width": "1px",
      "ident": divname,
      "infox": 10,
      "infoy": 10,
      "get_info_text": get_info_text,
      "show_event_labels": false,
      "show_title": false,
      "scale": 'log',
      "scale_offset": 1
    };

    if (extra_options) {
      options = _.extend(options, extra_options);
    }
    return makeChart(timeline_data, review_data, options);
  }

  function startingFunctionLarge(timeline_data, divname, suffix, review_data, callback, extra_options) {
    var options = {
      "build_menu": false,
      "multi_graph": false,
      "element": ("#" + divname),
      "width": 800,
      "height": 180,
      "getter": getAttr,
      "id_suffix": ("" + suffix),
      "max_points": 20,
      "getBounds": getBounds,
      "translatex": 20,
      "radius": 10,
      "show_xaxis": true,
      "show_info": true,
      "callback_on_click": callback,
      "graph_num": 0,
      "tick_width": 15,
      "tick_height": 90,
      "line_width": "4px",
      "ident": divname,
      "infox": 10,
      "infoy": 10,
      "get_info_text": get_info_text,
      "show_event_labels": true,
      "show_title": true,
      "scale": "linear",
      "scale_offset": 0
    };

    if (extra_options) {
      options = _.extend(options, extra_options);
    }
    return makeChart(timeline_data, review_data, options);
  }

  var makeChart = function (data, review_data, options) {
    var xAxis = 'Timeline (in minutes)';
    var maxElements = options.max_points;


    var bounds;

    if (options.bounds) {
      bounds = options.bounds;
    } else {
      bounds = options.getBounds(data, 1.0);
    }

    // SVG AND D3 STUFF
    var svg = d3.select(options.element)
      .append("svg")
      .attr("width", options.width)
      .attr("height", options.height);

    var xScale, yScale;

    if (options.callback_on_click !== undefined) {
      svg.on('click', function (d) {
        options.callback_on_click(options.ident);
      });
    };

    svg.append('g')
      .classed('chart' + options.id_suffix, true)
      .attr('transform', 'translate(' + options.translatex + ', 0)');

    function show_graph(timeline_data, rb_data ) {
      data = timeline_data;
      updateChart();
    };

    d3.select('svg g.chart' + options.id_suffix)
      .append('line')
      .attr('id', 'backline' + options.id_suffix)
      .style({'stroke-width': options.line_width,
        'stroke': "#555"});

    // X Axis label
    if (options.show_xaxis) {
      d3.select('svg g.chart' + options.id_suffix)
        .append('text')
        .attr({
          'id': 'xLabel' + options.id_suffix,
          'x': options.width / 2,
          'y': options.height - 15,
          'text-anchor': 'middle'
        })
        .text("Timeline (in minutes)");
    }

    if (options.show_title){
      d3.select('svg g.chart' + options.id_suffix)
        .append("text")
        .attr("x", (options.width / 2))
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        //.style("text-decoration", "underline")
        .text(review_data.id + ": " + review_data.summary);
    }

    function updateScales() {
      var xscalefunc = d3.scale.linear;
      var scale_offset = 0;

      if (options.scale === "log") {
        xscalefunc = d3.scale.log;
        scale_offset = options.scale_offset;
      }

      xScale = xscalefunc()
        .domain([bounds.min+scale_offset, bounds.max+scale_offset])
        .range([0, options.width - 2 * options.translatex]);  // TODO: fix these numbers

      yScale = d3.scale.linear()
        .domain([-10, 10])
        .range([options.height, 0]);  // TODO: fix these numbers
    }

    function setScale(scale, offset) {
      options.scale = scale;
      options.scale_offset = offset;
    }

    // Render points
    updateScales();

    var pointColor = d3.scale.category20b();
    var placeholderArray = Array(maxElements);
    for (var ix = 0; ix < placeholderArray.length; ix++) {
      placeholderArray[ix] = ix;
    }

    var rects = d3.select('svg g.chart' + options.id_suffix)
      .selectAll('rect')
      .data(placeholderArray)
      .enter()
      .append('rect')
      .attr({'width': options.tick_width})
      .attr('height', function(d){
        var res = options.getter(data, d, 'time_distance');
        return (res === undefined) ? 0 : options.tick_height;
      })
      .attr('x', function (d) {
        var res = options.getter(data, d, 'time_distance');
        res = (res === undefined) ? d3.select(this).attr('x') : xScale(res + options.scale_offset);
        return res;
      })
      .attr('y', function (d) {
        return yScale(0) - options.tick_height/2;
      })
      .attr('fill', function (d, i) {
        var res = options.getter(data, i, 'event');
        return getPointColor(res);
      });

    if (options.show_event_labels){
      d3.select('svg g.chart' + options.id_suffix)
        .selectAll('.eventText')
        .data(placeholderArray)
        .enter()
        .append('text')
        .attr('class','eventText')
        .attr({'font-size': '20px'})
        .attr('text-anchor', 'middle')
        .attr('opacity', function (d) {
          var res = options.getter(data, d, 'event');
          return (res === undefined) ? 0 : 100;
        })
        .attr('x', function (d) {
          var res = options.getter(data, d, 'time_distance');
          res = (res === undefined) ? d3.select(this).attr('x') : xScale(res + options.scale_offset)+(options.tick_width/2);
          return res;
        })
        .attr('y', function (d) {
          return yScale(0) - options.tick_height/2;
        })
        .text(function(d){
          var res = options.getter(data, d, 'event');
          return getPointLabel(res);
        });
    };

    if (options.show_info) {
      rects.style('cursor', 'pointer')

        .on("mouseover", function(d){
          eventOver(data, d, options, this);
        })
        .on("mousemove", function(){
          return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");
        })
        .on("mouseout", function(d){
          tooltip.style("visibility", "hidden");
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
        if (options.bounds) {
          bounds = options.bounds;
        } else {
          bounds = options.getBounds(data, 1.0);
        }
        updateScales();
      }

      d3.select('svg g.chart' + options.id_suffix)
        .selectAll('rect')
        .transition()
        .duration(400)
        .ease('quad-out')
        .attr('height', function(d){
          var res = options.getter(data, d, 'time_distance');
          return (res === undefined) ? 0 : options.tick_height;
        })
        .attr('x', function (d) {
          res = options.getter(data, d, 'time_distance');
          res = (res === undefined) ? d3.select(this).attr('x') : xScale(res  + options.scale_offset);
          return res;
        })
        .attr('y', function (d) {
          return yScale(0) - options.tick_height/2;
        })
        .attr('fill', function (d, i) {
          var res = options.getter(data, i, 'event');
          return getPointColor(res);
        });


      if (options.show_event_labels) {
        d3.select('svg g.chart' + options.id_suffix)
          .selectAll('.eventText')
          .transition()
          .duration(400)
          .ease('quad-out')
          .attr('opacity', function (d) {
            var res = options.getter(data, d, 'event');
            return (res === undefined) ? 0 : 100;
          })
          .attr('x', function (d) {
            var res = options.getter(data, d, 'time_distance');
            return (res === undefined) ? d3.select(this).attr('x') : xScale(res + options.scale_offset) + (options.tick_width / 2);
          })
          .attr('y', function (d) {
            return yScale(0) - options.tick_height/2 - 5;
          })
          .text(function (d) {
            var res = options.getter(data, d, 'event');
            return getPointLabel(res);
          });
      };


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
        .attr({'x1': xScale(mnx + options.scale_offset), 'y1': yScale(0), 'x2': xScale(mxx + options.scale_offset), 'y2': yScale(0)})
        .transition()
        .duration(500)
        .style('opacity', 1)
        .style({
          'stroke-width': options.line_width,
          'stroke': "#555"});
    }

    updateChart(true);
    return {
      'show_graph': show_graph,
      'updateChart': updateChart,
      'setScale': setScale 
    };
  };

  return {
      'startingFunctionSmall': startingFunctionSmall,
      'startingFunctionLarge': startingFunctionLarge
  };

} ();

