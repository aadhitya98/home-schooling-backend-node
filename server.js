const express = require("express");
const cors = require('cors')
const bodyParser = require("body-parser");
const MongoServer = require('./configuration/db');
const app = express();
const userDetails = require("./routes/userdetails");
const addclassDetails = require("./routes/addclassdetails");
MongoServer();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors())
app.get("/", (req, res) => {
    res.json({ message: "API Working" });
});

app.use("/api", userDetails);
app.use("/addclass", addclassDetails);
//userDetails.initialize(app)
app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});