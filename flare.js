// Based on: http://mbostock.github.io/d3/talk/20111018/tree.html
// Including this as an HTML comment at the top results in losing 
// the stroke color on my circles... why is that? Oh, I think I put it inside the style section.

function executeFlare(fileJSONdata) {
    
var m = [0, 120, 0, 180], // y, x, y, x (not what I would expect)
    w = 1280 - m[1] - m[3],
    h = 700 - m[0] - m[2],
    i = 0,
    root,
    categoryToShow = 0; // Default category which is expanded for everyone (0-5)

var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#body").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  var categories = [ "Teaching", "Advising", "Research", "Partners", "Committees", "Administers" ];
    
d3.json(fileJSONdata, function(json) {
    // why was json copied over to root?
  root = json;
  root.x0 = h / 2;
  root.y0 = 0;
  
  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }
  
    removeSplitterAll(root);

    // Initialize the display to show just the Teaching category for everyone
    showOneCategory( root, categoryToShow );

    update(root);

});

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Horizontal spacing of nodes
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 260; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { toggle(d); update(d); });

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "darkseagreen" : "#fff"; });

  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 5.5)
      .style("fill", function(d) { return d._children ? "darkseagreen" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  
  // Refresh display based on radio button selection
  // TODO: (Incorrectly) doesn't refresh if the root is collapsed
  // TODO: Doesn't correctly handle cases where a faculty node (level 1) is collapsed
  d3.selectAll("input").on("change", function () {

    // Which category are we supposed to display?
    categoryToShow = categories.indexOf(this.value); 
    showOneCategory( root, categoryToShow );    
    update( root );
  });
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}


function showAll(d) {
    if (d._children) {
      d._children.forEach(showAll);
      show(d);
    }
  }
  

// Show hidden children
function show(d) {
    if (d._children) {
        d.children = d._children;
        d._children = null;
    }
}

  
// Hide showing children
function hide(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    }
}


// Hide all children
function hideAll(d) {
    if (d.children) {
        d.children.forEach(hideAll);
        hide(d);
    }
}

function removeSplitterAll(d){
    if (d.children) {
        d.children.forEach(removeSplitterAll);
        removeSplitter(d);
    }
}

// TODO: I should be passing the replacement character as a parameter,
// But I'm not sure if that works with the d3.js forEach()... 
// it doesn't seem like you can pass parameters to forEach()
function removeSplitter(d) {
    d.name = d.name.replace("=", "");
}

function showOneCategory( source, category ) {
    // Hide all children as the starting point
    source.children.forEach( hideAll );

    for (var index =0; index < source.children.length; index++) {
        show( source.children[ index ]);
        show( source.children[ index ].children[ category ]);
    }
}
}