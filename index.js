var express = require("express");
var request = require("request");
var facts = require("./facts.js").getFacts();
require("dotenv").load();

//TODO: Verify slack communication with signing secret

//clientId and clientSecret stored as system variables
var clientId = process.env.CLIENTID;
var secret = process.env.SECRET;
const PORT = process.env.PORT || 3000;

//return single fact not in array for slack api
var getFact = function() {
    return facts[Math.floor(Math.random() * facts.length)];
};

//returns facts in array (always used for direct calls)
var getFacts = function(num) {
    let out = [];
    shuffle(facts);
    for(let i = 0; i < num; i++)
    {
        out.push(facts[i]);
    }
    return out;
}

//shuffles the array passed
var shuffle = function(arr) {
    let j, x, i;
    for(i = arr.length-1; i > 0; i--) {
        j = Math.floor(Math.random() * (i+1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
}

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

//Route for POST requests through slack slash command
app.post("/api/slack", function(req, res) {
    res.send({
        "response_type": "in_channel",
        "text": getFact(1)
    });
});

//Route for direct GET requests to get multiple facts
app.get("/api/facts", function(req, res) {
    let number = (req.query.number > facts.length) ? facts.length : req.query.number;
    res.send({
        "number": number,
        "facts": getFacts(number),
        "success": true
    })
});
