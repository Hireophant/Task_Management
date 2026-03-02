const express = require("express");
const database = require("./config/database");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

app.use(cors());

const routesApiVer1 = require("./api/v1/routes/index.route");

database.connect();

app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

// Router Version 1
routesApiVer1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
