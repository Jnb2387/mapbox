var express = require("express");
var bodyParser = require("body-parser");
// var pg = require("pg");
var logger = require("morgan");
var https = require("https"); // not sure if needed
var http = require("http"); // not sure if needed
var fs = require("fs");
var app = express();
var path = require("path");


//My files
// var mark = require("./routefuncs/mark.js"); //just a file for now
// var db = require("./db"); //Datbase connection file
var router = require("./router")

//middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(logger("dev"));
// app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use('/map', router)

// Read the file system for the self assigned certificate.
var options = {
  pfx: fs.readFileSync("C:/Users/jnb23/Desktop/serverCert.pfx"),
  passphrase: "navy23"
};

http.createServer(app).listen(3000);
https.createServer(options, app).listen(443);
console.log("Server Running");
