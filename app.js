//globalDeclaration
require("./utils/globals");
const express = require('express');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const i18n = require('./i18n');

let env;
if (process.env.NODE_ENV == "production") {
    console.log("environment","prod")
    env = require("./config/env.prod.json")
} 
else {
    console.log("environment","dev")
    env = require("./config/env.dev.json")
}
global.env = env; 

require("./config/db")();

const app = express();
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '150mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

app.use(i18n);
// Use Morgan for request logging
app.use(morgan('dev'));

// Load your routes
require('./routes')(app);
module.exports = app;