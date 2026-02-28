const express = require("express");
const database = require("./config/database");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

const routesApiVer1 = require("./api/v1/routes/index.route");

database.connect();

// parse application/json
app.use(bodyParser.json());

// Router Version 1
routesApiVer1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
