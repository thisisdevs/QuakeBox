//current context variables
var currentUrl="https://earthquake.usgs.gov/fdsnws/event/1/query&format=geojson";
var currentJsonObj;
let currentPage = 0;
var quakes_to_show;
//
const navigator = document.querySelector('#navigator');
const nextButton = document.querySelector('#next-page');
const previousButton = document.querySelector('#previous-page');
//this function sets the color of magnitude indicator according to threat level
function colorFromMagnitude(mag){
  var colors = ["#4caf50","#1b5e20","#ffb300","#e65100"," #f44336"];
  if(mag > 9){
    return "#b71c1c";
  }
  else if(mag < 0){
    return colors[0];
  }
  return colors[Math.floor(mag/2)];
};

//converts utc date into human readable date
function getTrueDate(utc){
  var date = new Date(utc);
  return date.toString();
};
//return place offset and place string from single address string
function formattedPlace(place) {
  if(place.indexOf(" of ")>-1){
  var strArray = place.split(" of ");
  strArray[0] = strArray[0] + " of";}
  else{
    strArray = [" ",place];
  }
  return strArray;
}

function buildQuakeBox(mag,place_offset,place_from,utc,tsunami_alert,map_url,details_url){
  var quakebox = document.createElement("div");
  quakebox.className = "quakebox";

  var magnitude = document.createElement("div");
  magnitude.className = "magnitude";
  magnitude.textContent = mag;
  magnitude.style.backgroundColor = colorFromMagnitude(mag);
  quakebox.appendChild(magnitude);

  var details = document.createElement("a");
  details.className = "details";
  details.href = details_url;
  details.target = "_blank";

  var offset = document.createElement("h6");
  offset.textContent = place_offset;
  details.appendChild(offset);

  var place = document.createElement("h2");
  place.textContent = place_from;
  details.appendChild(place);

  var time_stamp = document.createElement("h5");
  time_stamp.textContent = getTrueDate(utc);
  details.appendChild(time_stamp);

  quakebox.setAttribute("data-time",String(utc));
  var tsunami = document.createElement("div");
  tsunami.className = "tsunami";
  var span_text_one = document.createElement("span");
  span_text_one.textContent = "TSUNAMI ALERT:";
  var span_text_two = document.createElement("span");
  if(tsunami_alert == 0){
    span_text_two.textContent = " NO";
    tsunami.style.backgroundColor = "green";
  }
  else {
    span_text_two.textContent = "YES";
    tsunami.style.backgroundColor = "red";
  }
  tsunami.appendChild(span_text_one);
  tsunami.appendChild(span_text_two);
  details.appendChild(tsunami);

  quakebox.appendChild(details);

  var map = document.createElement("a");
  map.className = "map-btn";
  map.href = map_url;
  map.target = "_blank";
  quakebox.appendChild(map);
  return quakebox;
}


function get(url) {
// Return a new promise.
return new Promise(function(resolve, reject) {
  // Do the usual XHR stuff
  var req = new XMLHttpRequest();
  req.open('GET', url,true);

  req.onload = function() {
    // This is called even on 404 etc
    // so check the status
    if (req.status == 200) {
      // Resolve the promise with the response text
      resolve(req.responseText);
    }
    else {
      // Otherwise reject with the status text
      // which will hopefully be a meaningful error
      reject(Error(req.responseText));
    }
  };

  // Handle network errors
  req.onerror = function() {
    reject(Error("Oops! Network Error"));
  };

  // Make the request
  req.send(null);
});
}
function searchAndShow(reVal,jsonobj) {
  console.log("searching");
  function searchforquery(rgexp,jobj) {

    return jsonobj.filter(function(el){
      return rgexp.test(el['properties']['place']);
    });
  }
  var quakes = searchforquery(reVal,jsonobj);
  var frame = document.createElement('div');
  frame.className = 'frame';
  document.querySelector('.tag').textContent = String(quakes.length)+" Results";
  //quakes_to_show = divideAndShow(quakes);
  addQuakeBoxes(quakes);

}

function divideAndShow(quakes){
  var no_of_pages = Math.floor(quakes.length/50) + 1;
  var pagedQuakes = [];
  if(no_of_pages == 1){
    pagedQuakes.push(quakes);
    navigator.style.display = "none";
  }
  else{
    navigator.style.display = "";
    var startingPoint = 0;
    var endingpoint = 50;
    var i = 0;
    while(i<(no_of_pages-1)){
      pagedQuakes.push(quakes.slice(startingPoint,endingpoint));
      startingPoint = endingpoint + 0;
      endingpoint = endingpoint + 50;
      i += 1;
    }
    if(quakes.length !== 50*pagedQuakes.length){
    endingpoint = endingpoint + (quakes.length % 50) + 1;
    pagedQuakes.push(quakes.slice(startingPoint,endingpoint));
    }
    //show results

  }
  return pagedQuakes;
}
