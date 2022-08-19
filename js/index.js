var intention = {};
var map = {
  a: '1',
  b: '2',
  c: '3',
  d: '4',
  e: '5',
  f: '6',
  g: '7',
  h: '8',
  i: '9',
  j: '1' /*10*/ ,
  k: '2' /*11*/ ,
  l: '3' /*12*/ ,
  m: '4' /*13*/ ,
  n: '5' /*14*/ ,
  ñ: '6' /*14*/ ,
  o: '7' /*15*/ ,
  p: '8' /*16*/ ,
  q: '9' /*17*/ ,
  r: '1' /*18*/ ,
  s: '2' /*19*/ ,
  t: '3' /*20*/ ,
  u: '4' /*21*/ ,
  v: '5' /*22*/ ,
  w: '6' /*23*/ ,
  x: '7' /*24*/ ,
  y: '8' /*25*/ ,
  z: '9' /*26*/
};

// Sigil time!
var svg = d3.select("svg");

var square = svg.selectAll("rect.grid")
  .data([1, 2, 3, 4, 5, 6, 7, 8, 9]);

var squareEnter = square.enter().append("rect");
squareEnter.attr("class", 'grid');

squareEnter.attr("x", function(d, i) {
  if (i === 0 || i === 1 || i === 2) {
    return i * 100;
  } else if (i === 3 || i === 4 || i === 5) {
    return i * 100 - 300;
  } else if (i === 6 || i === 7 || i === 8) {
    return i * 100 - 600;
  }
});
squareEnter.attr("y", function(d, i) {
  if (i === 0 || i === 1 || i === 2) {
    return 0;
  } else if (i === 3 || i === 4 || i === 5) {
    return 100;
  } else if (i === 6 || i === 7 || i === 8) {
    return 200;
  }
});
squareEnter.attr("width", 100);
squareEnter.attr("height", 100);
squareEnter.attr("fill", 'white');
squareEnter.attr("stroke", 'lightgrey');
squareEnter.attr("stroke-width", '1');

var dataID = 1;
$('svg rect.grid').each(function() {
  $(this).attr('data-id', dataID);
  dataID++
});

function convertToNumbers(text) {
  return text.split('').filter(function(v) {
    // Filter out characters that are not in our list
    return map.hasOwnProperty(v);
  }).map(function(v) {
    // Replace old character by new one
    return map[v];
  }).join('');
}

// Form Submission
$('#form').on('submit', function(e) {
  // Stop submission
  e.preventDefault();
  $('.result .duplicates, .result .no-vowels, .result .numbers').hide();

  if ( $('svg path.sigil').length ) {
    $('marker').fadeOut();
    $('svg path.sigil').fadeOut(300, function(){
      $(this).remove();
    });
    $('.result .duplicates, .result .no-vowels, .result .numbers').empty();
  }

  intention.original = $('#my-will').val().toLowerCase();
  intention.reversedArray = intention.original.split("").reverse();
  intention.originalReverse = intention.reversedArray.join("");

  // Remove punctiation and spaces
  intention.nopunctuation = intention.originalReverse.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  intention.duplicates = intention.nopunctuation.replace(/(.)(?=.*\1)/g, '');
  // Remove spaces too
  intention.duplicates = intention.duplicates.replace(/\s+/g, '');
  intention.noVowels = intention.duplicates.replace(/[aeiou]/ig, '');
  intention.noVowelsArray = intention.noVowels.split("");
  intention.noVowelsArray = intention.noVowelsArray.reverse();
  intention.noVowels = intention.noVowelsArray.join("");
  intention.numbers = convertToNumbers(intention.noVowels);
  // Create array of numbers to draw lines with
  intention.sigilNumbers = intention.numbers.split('');

  $('.result .no-vowels').append(intention.noVowels);
  $('.result .numbers').append(intention.numbers);

  $('.result .duplicates').slideDown(250, function(){
    $('.result .no-vowels').slideDown(250, function(){
      $('.result .numbers').slideDown(250, function(){
        sigilTime();
      });
    });
  });

});

function sigilTime() {
  var lineData;
      lineData = getNodes();

  var firstItem = lineData[0];
  var lastItem = lineData[lineData.length-1];
  intention.lineData = lineData;
  intention.firstAndLast = [firstItem,lastItem];

  var lineFunction = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; })
                    .interpolate("linear");

  $('marker').fadeIn(300);
  var drawSigil = svg.append("path")
                      .attr("d", lineFunction(lineData))
                      .attr("stroke", "black")
                      .attr("stroke-width", 4)
                      .attr("fill", "none")
                      .attr("class", "sigil")
                      .attr("marker-start", "url(#markerCircle)")
                      .attr("marker-end", "url(#markerRect)")
                      .call(transition);
  }

function getNodes() {
  var lineData = new Array;
  for (var num in intention.sigilNumbers) {
    var $node = $('[data-id=' + intention.sigilNumbers[num][0] + ']');

    $node.each(function(){
     lineData.push([
        parseInt($(this)[0].attributes.x.value) + 50,
        parseInt($(this)[0].attributes.y.value) + 50
      ]);
    });
  }
  return lineData;
}

function transition(path) {
  path.transition()
      .duration(5000)
      .attrTween("stroke-dasharray", tweenDash);
      //For infitine loop: .each("end", function() { d3.select(this).call(transition); });
}

function tweenDash() {
  var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) { return i(t); };
}



d3.select("#savesvg").on("click", function(e){
  //e.preventDefault();

  var html = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.cloneNode(true);
  html = $(html).find('rect.grid').remove().end();
  html = html[0].innerHTML;

  //console.log(html[0].innerHTML);
  var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
  var a = document.createElement("a");
  a.download = "sigil.svg";
  a.href = imgsrc;
  a.click();
});

d3.select("#savepng").on("click", function(e){
  // Create hidden DOM
  var canvas = document.createElement('canvas');
      canvas.width = 300,
      canvas.height = 300;
  var context = canvas.getContext('2d');

  // Create and SVG and IMG
  var html = d3.select('svg')
          .attr('version', 1.1)
          .attr('xmlns', 'http://www.w3.org/2000/svg')
          .node().parentNode.cloneNode(true);
    html = $(html).find('rect.grid').remove().end();
    html = html[0].innerHTML;
  var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);

  var image = new Image;
  image.src = imgsrc;

  // Add IMG to CANVAS and save
  image.onload = function() {
    context.drawImage(image, 0, 0);

    var a = document.createElement('a');
    //a.target = '_blank'
    a.download = "sigil.png";
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
});

$('[data-toggle="tooltip"]').tooltip()
