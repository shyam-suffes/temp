'use strict';
const mongoose = require("mongoose");
const logger = require('../logger');
const { getParameter } = require('../../lib/ssm');

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    const dbUrl = global.env.MONGODB_URL ? global.env.MONGODB_URL : await getParameter('Vitel-tech-DB-URL');
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info({ apiModule: "db connection", apiHandler: "db.js" }, "Connected to MongoDB");
  } 
  catch (error) {
    console.log("Error", error);
    logger.info({ apiModule: "db connection", apiHandler: "db.js" }, {"Error connecting to MongoDB": error });
  }
};
module.exports = connectMongoDB;