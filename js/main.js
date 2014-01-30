// from http://stackoverflow.com/a/326076/120290
function inIframe() {
    try {
        return window.self !== window.top;
    } catch(err) {
        return true;
    }
}

$( document ).ready(function() {  
  if(inIframe()) $("body").addClass("iframed");
});

//////////////////////////////////////////////////////////////////////////////////////////
// DRAWING FUNCTIONS /////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function drawArrow(parent, from, to, degrees, clockwise) {
  /* 
  PARAMETERS:
    parent:   the svg container or element to which to append the arrow
    from:     the pixel coordinates from which to draw the arrow as an array [x,y], e.g. [100,200]
    to:     works just like {from}
    degrees:   the angle which the arc of the arrow will subtend. 
          90 for a gentle arc, 180 for a bigger swoop.
          beyond 180, it gets gentler again, because of the way SVG computes arc.
          pass 0 or 360 for a straight arrow.
    clockwise:   boolean determining whether arrow will swoop clockwise (true) or counterclockwise (false)
  */
  
  /* 
  FIRST, compute radius of circle from desired degrees for arc to subtend.
    read up:  http://mathworld.wolfram.com/Chord.html
          http://www.wolframalpha.com/input/?i=angle+subtended
    n.b.:  bizweek only uses circular arcs, but SVG allows for any ellipse, so r1 == r2 in SVG path below
        bizweek arrows typically subtend 90 or 180 degrees
  */
  
  // bound acceptable {degrees}, between 1 and 359
  degrees = Math.max(degrees, 1);
  degrees = Math.min(degrees, 359);
  
  // get the chord length ("height" {h}) between points, by pythagorus
  var h = Math.sqrt(Math.pow((to[0]-from[0]),2)+Math.pow((to[1]-from[1]),2));
  
  // get the distance at which chord of height h subtends {angle} degrees
  var radians = degrees * Math.PI/180;
  var d = h / ( 2 * Math.tan(radians/2) );
  
  // get the radius {r} of the circumscribed circle
  var r = Math.sqrt(Math.pow(d,2)+Math.pow((h/2),2));
  
  /*
  SECOND, compose the corresponding SVG arc.
    read up: http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    example: <path d = "M 200 50 a 90 90 0 0 1 100 0"/>
  */
  var path = "M " + from[0] + " " + from[1] + " a " + r + " " + r + " 0 0 "+(clockwise ? "1" : "0")+" " + (to[0]-from[0]) + " " + (to[1]-from[1]);
  
  // append path to given {parent} (with class .arrow)
  var arrow = parent.append("path")
    .attr("d", path)
    .attr("marker-end", "url(#arrowhead)")
    .attr("class", "arrow");
  
  // return a reference to the appended arrow
  return arrow;
}

// draw sample arrow
var mouseArrow = drawArrow(d3.select("#svg-canvas"), [100,200], [300,300], 120, true);
$(document).on("mousemove", function(e) {
  mouseArrow.remove();
  mouseArrow = drawArrow(d3.select("#svg-canvas"), [100,200], [e.pageX,e.pageY], 120, true);
});