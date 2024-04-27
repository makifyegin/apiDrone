require('dotenv').config()

var bodyParser = require("body-parser");

let express = require('express');
let app = express();
let absolutePath = __dirname + '/views/index.html'

function helloExpress(req, res) {
  res.sendFile(absolutePath);
}


// function json(req, res){
//   let message = "Hello json";
//   if(process.env.MESSAGE_STYLE==="uppercase"){
//     req.res.json({"message": message.toUpperCase()})

//   }else{
//     req.res.json({"message": message})

//   }
// }
function logger(req, res, next) {

  const method = req.method;
  const path = req.path;
  const ip = req.ip;

  console.log(`${method} ${path} - ${ip}`);
  next();

}

app.use(logger);

app.get(
  "/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.send({
      time: req.time
    });
  }
);



app.get("/", helloExpress)
app.use('/public', express.static(__dirname + "/public"))
app.get('/json', (req, res) => {
  let message = "Hello json";
  if (process.env.MESSAGE_STYLE === "uppercase") {
    message = message.toUpperCase();
  }

  res.json({
    message: message
  })
});


app.get('/:word/echo',(req, res)=>{
  const {word} = req.params;
  res.json({
    echo: word
  })
});



app.use(bodyParser.json());

// Placeholder variables to store flight data
let flightData = null;

// POST request to initiate a flight
app.post('/startFlight', (req, res) => {
  // Extract start and end locations, and flight duration from the request body
  const { startLocation, endLocation, flightDuration } = req.body;

  // Store flight data
  flightData = {
    startLocation,
    endLocation,
    flightDuration,
    startTime: Date.now() // Record start time
  };

  res.status(200).send('Flight initiated successfully!');
});

// GET request to retrieve current latitude and longitude of the plane
app.get('/getCurrentLocation', (req, res) => {
  // If no flight data exists, return an error
  if (!flightData) {
    return res.status(400).send('No flight data available. Please initiate a flight first.');
  }

  // Calculate elapsed time since the flight started
  const elapsedTime = Date.now() - flightData.startTime;

  // If elapsed time exceeds flight duration, return end location
  if (elapsedTime >= flightData.flightDuration) {
    return res.json({
      latitude: flightData.endLocation.latitude,
      longitude: flightData.endLocation.longitude
    });
  }

  // Otherwise, calculate current location based on elapsed time
  const progressPercentage = elapsedTime / flightData.flightDuration;
  const currentLatitude = flightData.startLocation.latitude + 
                           (progressPercentage * (flightData.endLocation.latitude - flightData.startLocation.latitude));
  const currentLongitude = flightData.startLocation.longitude +
                            (progressPercentage * (flightData.endLocation.longitude - flightData.startLocation.longitude));

  // Return current location
  res.json({
    latitude: currentLatitude,
    longitude: currentLongitude
  });
});



























module.exports = app;
