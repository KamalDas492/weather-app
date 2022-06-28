const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

const apiKey = "b49aa6e5b695a9fc42ff76a5f36955c7";
var currWeather;
var pollution;
app.get("/", function(req,res){
  res.render("index", {flag:0});
})

app.get("/current-weather", function(req,res){
  res.render("currWeather", {weatherData:currWeather, pollutionData:pollution});
})

app.post("/current-weather",  function(req, res){
  if (req.body.button == "city-btn") {
    var cityName;
     cityName = req.body.cityname;
    var coordUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + apiKey;
    var str = "";
    var long, lat;
    https.get(coordUrl, function(response) {
      response.on("data", function(data) {
        //const coordData = JSON.parse(data);
        str += data;
      });
    //  request.on('error', function(e) {
      //  res.render("index", {flag:1});
    //  });
      response.on("end", function (){
        const coordData = JSON.parse(str);
        if (coordData.length == 0){
          res.render("index", {flag:1});
        }else{

          lat = coordData[0].lat;
          long = coordData[0].lon;
          //console.log(coordData.lat);
          var weatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=alerts,hourly,minutely&units=metric&appid=" + apiKey;
          var weather = "";
          var countryName = cityName + ", " + coordData[0].country;
          https.get(weatherURL, function(resp) {
            resp.on("data", function(datachunk) {
              //const coordData = JSON.parse(data);
              weather += datachunk;
            });
            resp.on("end", function (){
              const weatherData = JSON.parse(weather);
              //console.log(weatherData);
              function timeReturn(timestamp) {
                var date = new Date(timestamp * 1000);
                var timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                return timeString;
              }

              var today  = new Date();
              var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
              var currentDate = today.toLocaleDateString("en-US", options);
              //var timestamp = weatherData.current.dt;
              //var currentDate = dateReturn(timestamp);
              //var currTime = timeReturn(timestamp);
            //  console.log(currentDate);
               //var countryname = "kolkata";
               var descri = weatherData.current.weather[0].description;

               currWeather = {
                location: countryName,
                date: currentDate,
                sunrise: timeReturn(weatherData.current.sunrise),
                sunset: timeReturn(weatherData.current.sunset),
                temperature: weatherData.current.temp,
                feels:weatherData.current.feels_like,
                pressure: weatherData.current.pressure,
                humidity:weatherData.current.humidity,
                uvi:weatherData.current.uvi,
                dewPoint:weatherData.current.dew_point,
                visibility:weatherData.current.visibility,
                windspeed:weatherData.current.wind_speed,
                weatherDescr: descri.charAt(0).toUpperCase() + descri.slice(1),
                icon:"https://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + "@2x.png"

              };
              var polUrl = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + long + "&appid=" + apiKey;
              var pol = "";
              https.get(polUrl, function(respo) {
                respo.on("data", function(datac) {
                  pol += datac;
                });
                respo.on("end", function (){
                  const polData = JSON.parse(pol);
                  pollution = {
                    aqi:polData.list[0].main.aqi,
                    co:polData.list[0].components.co,
                    no:polData.list[0].components.no,
                    no2:polData.list[0].components.no2,
                    so2:polData.list[0].components.so2,
                    o3:polData.list[0].components.o3,
                    pm25:polData.list[0].components.pm2_5,
                    pm10:polData.list[0].components.pm10
                  }
                  res.redirect("current-weather");
                });
              });


            });
          });
        }
      });
    }).on('error', (e) => {
console.error(e);
});


  }

})

app.listen("3000", function() {
  console.log("Server is running");
});
