const path = require("path");
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

// const database = require("./db.js");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname + "/public/" });
});

app.get("/download", (req, res) => {
  res.sendFile("download.html", { root: __dirname + "/public/" });
});

app.post("/downloadMain", (req, res) => {
  setTimeout(() => {
    const downloadPath = path.join(
      __dirname + "/public/versions/latest/Rage-Installer.exe"
    );
    res.download(downloadPath, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }, 500);
});

app.get("/downloadHelper", (req, res) => {
  setTimeout(() => {
    const downloadPath = path.join(
      __dirname + "/public/versions/helper/Rage-Backend.exe"
    );
    res.download(downloadPath, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }, 500);
});

app.listen(process.env.PORT || 5000);
