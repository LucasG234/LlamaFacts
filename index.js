var express = require("express");
var request = require("request");
var facts = require("./facts.js").getFacts();
require("dotenv").load();

//TODO: Verify slack communication with signing secret

//clientId and clientSecret stored as system variables
var clientId = process.env.CLIENTID;
var secret = process.env.SECRET;
const PORT = process.env.PORT || 3000;

var getFact = function() {
    var random = Math.floor(Math.random() * facts.length);
    return "Llama Fact " + (random+1) +": " + facts[random];
};

var app = express();

app.listen(PORT, function() {
    if(secret&&clientId)
        console.log("ID and Secret successfully read");
    console.log("App initialized on port " + PORT);
});

//Route for GET requests to root address
app.get("/", function(req, res) {
    res.send("Connection established through path: " + req.url);
});

//Route for GET requests through Slack oAuth process
app.get("/oauth", function(req, res) {
    //If request doesn't contain required code, throw an error
    if(!req.questy.code) {
        req.status(500);
        res.send({"Error": "Code not received"});
        console.log("Problem receiving code");
    }
    else {
        //GET call to Slack"s oauth endpoint
        request({
            url: "https://slack.com/api/oauth.access",
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret},
            method: "GET",
        }, function(error, response, body) {
            if(error) {
                console.log(error);
            } else {
                res.json(body);
            }
        });
    }
});

//Route for POST requests through slash command
app.post("/llamafact", function(req, res) {
    res.send({
        "response_type": "in_channel",
        "text": getFact()
    });
});
