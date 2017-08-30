var express = require('express');
var router = express.Router();//require the Router mini-app module


//Routes
router.get("/mapbox", function(req, res, next) {
    res.sendFile('./public/index.html',{root: __dirname });
});

module.exports = router