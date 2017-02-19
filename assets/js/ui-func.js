//ui variables
var loader = document.createElement("div");
loader.className = 'loader';
var loader_by_class = document.querySelector('.loader');
var tag = document.createElement("span");
tag.className = 'tag';
var tag_by_class = document.querySelector('.tag');
var frame = document.createElement('div');
frame.className = 'frame';

//other global variables
var basic_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";

var mq = window.matchMedia( "(max-width: 850px)" );
if (mq.matches) {
  // window width is at least 500px
  $(window).scroll(function(){
    $(".scroll-top-btn").toggleClass("gone",$(window).scrollTop()>600);
  });
  document.querySelector('.scroll-top-btn').addEventListener("click",function(){
      window.scrollTo(0,0);
  });

} else {
  // window width is less than 500px
  $(".main-wrap").scroll(function(){
    $(".scroll-top-btn").toggleClass("gone",$(".main-wrap").scrollTop()>600);
  });
  document.querySelector('.scroll-top-btn').addEventListener("click",function(){
    $('.main-wrap').animate({
     scrollTop: 0
  }, 'slow');
  });

}



$('.form_date').datetimepicker({
      language:  'fr',
      weekStart: 1,
      todayBtn:  1,
      autoclose: 1,
      todayHighlight: 1,
      startView: 2,
      minView: 2,
      forceParse: 0
});


document.querySelector('#search-btn').addEventListener('click',function(evt){
  evt.preventDefault();
  currentPage = 0;
  console.log("button clicked");
  var minimum_magnitude = document.querySelector('#minmag');
  var starting_date = document.querySelector("#startdate");
  var end_date = document.querySelector('#enddate');

  var frame_by_class = document.querySelector(".frame");
  var loader_by_class = document.querySelector('.loader');
  var tag_by_class = document.querySelector('.tag');

  var correct_mag_format = /^[+-]?\d+(\.\d+)?$/;
  if(!correct_mag_format.test(minimum_magnitude.value)){
    document.querySelector('#error').textContent = "not a number!";
  }
  else {
      currentPage = 0;
      document.querySelector('#error').textContent = "";
      if(frame_by_class !== null){
          document.querySelector('.frame-wrap').removeChild(frame_by_class);
      }
      document.querySelector('.main-wrap').appendChild(loader);
      if(tag_by_class !== null){
      document.querySelector('.frame-wrap').removeChild(tag_by_class);
      }
      document.querySelector('#search-bar').style.display = "none";
      navigator.style.display = "none";
      var qurl = basic_url;
      if(starting_date.value !== ""){
        qurl += "&starttime="+starting_date.value;
      }
      if(end_date.value !== ""){
        qurl += "&endtime="+end_date.value;
      }

      qurl += "&minmagnitude="+minimum_magnitude.value;
      get(qurl).then(function(response){
        return JSON.parse(response);
      },function(err){
        frame.textContent = err;
        document.querySelector('.frame-wrap').appendChild(frame);
        document.querySelector('.main-wrap').removeChild(document.querySelector('.loader'));
      }).then(function(jsonobj){
        if(document.querySelector('.loader') !== null){
            document.querySelector('.main-wrap').removeChild(document.querySelector('.loader'));
        }
        currentJsonObj = jsonobj['features'];
        document.querySelector('#search-bar').style.display = "";
        tag.textContent = "Total results: "+String(currentJsonObj.length);
        document.querySelector('.frame-wrap').appendChild(tag);
        document.querySelector('.frame-wrap').appendChild(frame);
        navigator.style.display = "";
        previousButton.style.display = "none";
        nextButton.style.display = "";
        quakes_to_show = divideAndShow(currentJsonObj)[currentPage];
        addQuakeBoxes(quakes_to_show);
      },function(err){
        console.log("error");
      });
  }
});
$( document ).ready(function() {
    document.querySelector('#search-bar').style.display = "none";
    navigator.style.display = "none";

    get(basic_url+'&limit=500').then(function(response){
      return JSON.parse(response);
    },function(errorMessage){
      document.querySelector('.main-wrap').removeChild(document.querySelector('.loader'));
      frame.textContent = errorMessage;
      document.querySelector('.frame-wrap').appendChild(frame);
    }).then(function(jsonobj){
      currentJsonObj = jsonobj['features'];
      document.querySelector('#search-bar').style.display = "";
      document.querySelector('.tag').textContent = "Recent Earthquakes :";
      document.querySelector('.main-wrap').removeChild(document.querySelector('.loader'));
      navigator.style.display = "";
      previousButton.style.display = "none";
      nextButton.style.display = "";
      //frame.innerHTML = currentJsonObj;
      //document.querySelector('.frame-wrap').appendChild(frame);
      //addQuakeBoxes(jsonobj);
      quakes_to_show = divideAndShow(currentJsonObj)[currentPage];
      addQuakeBoxes(quakes_to_show);
    },function(err){
      console.log(err);
    });
});

function addQuakeBoxes(jsonobj){
  if(document.querySelector('.frame')){
    document.querySelector('.frame-wrap').removeChild(document.querySelector('.frame'));
  }
  var frame = document.createElement('div');
  frame.className = 'frame';
  var featureArray = jsonobj;
  console.log(jsonobj);
  featureArray.forEach(function(item){
    var quakeObj = item['properties'];
    var mapCoordinates = item['geometry']['coordinates'];
    var mag = quakeObj['mag'];
    //document.body.appendChild(document.createTextNode(String(mag)));
    var place = quakeObj['place'];
    var place_offset = formattedPlace(place)[0];
    //document.body.appendChild(document.createTextNode(place_offset));
    var place_from = formattedPlace(place)[1];
    //document.body.appendChild(document.createTextNode(place_from));
    var utc = quakeObj['time'];
    //document.body.appendChild(document.createTextNode(String(utc)));
    var durl = quakeObj['url'];
    //document.body.appendChild(document.createTextNode(url));
    var tsunami = quakeObj['tsunami'];
    //document.body.appendChild(document.createTextNode(String(tsunami)));
    var map_url = "http://maps.google.com/?q=" + String(mapCoordinates[1])+","+String(mapCoordinates[0]);
    frame.appendChild(buildQuakeBox(mag,place_offset,place_from,utc,tsunami,map_url,durl));
    document.querySelector('.frame-wrap').appendChild(frame);
  });
}


//place-search
document.querySelector('#place-search-button').addEventListener('click',function(evt){
  evt.preventDefault();
  navigator.style.display = "none";
  if(document.querySelector('#place-search-query').value !== ""){
    if(document.querySelector('.frame'))
      document.querySelector('.frame-wrap').removeChild(document.querySelector('.frame'));
    var rgexp = RegExp(document.querySelector('#place-search-query').value,'i');
    searchAndShow(rgexp,currentJsonObj);

  }
});

nextButton.addEventListener('click',function(evt){
  document.querySelector('.frame-wrap').removeChild(document.querySelector('.frame'));
  currentPage += 1;
  console.log(currentPage);
  quakes_to_show = divideAndShow(currentJsonObj)[currentPage];
  console.log(quakes_to_show);
  addQuakeBoxes(quakes_to_show);
  if(currentPage === (divideAndShow(currentJsonObj).length - 1)){
    nextButton.style.display = "none";
  }
  if(currentPage !== 0){
    previousButton.style.display = "";
  }
});

previousButton.addEventListener('click',function(evt){
  document.querySelector('.frame-wrap').removeChild(document.querySelector('.frame'));
  currentPage -= 1;
  quakes_to_show = divideAndShow(currentJsonObj)[currentPage];
  addQuakeBoxes(quakes_to_show);
  if(currentPage !== (divideAndShow(currentJsonObj).length - 1)){
    nextButton.style.display = "";
  }
  if(currentPage === 0){
    previousButton.style.display = "none";
  }
});
