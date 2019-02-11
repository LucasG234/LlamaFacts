var express = require('express');
var request = require('request');
require('dotenv').load();

//clientId and clientSecret stored as system variables
var clientId = process.env.CLIENTID;
var secret = process.env.SECRET;
