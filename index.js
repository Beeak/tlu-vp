const express = require("express");
const fs = require("fs").promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka katte
const bodyparser = require("body-parser");
const dateET = require("./src/dateTimeET");
const folkWisdom = require("./src/folkWisdom");

const regTextRef = "public/txt/visits.txt";

const PORT = 5021;
// kaivitan express.js functioni ning annan nimeks "app"
const app = express();

//maarame veebilehtedele mallide renderdamise mootori
app.set("view engine", "ejs");

//maaran uhe paris kataloogi virtuaalses serveris kattesaadavaks
app.use(express.static("public"));

//marsuudid
app.get("/", (req, res) => {
  //   res.send("Express.js laks kaima ja serveerib meile veebi.");

  const dayNow = dateET.fullDay();
  const dateNow = dateET.fullDate();
  const timeNow = dateET.fullTime();

  res.render("index", { dayNow, dateNow, timeNow });
});

app.get("/vanasona", async (req, res) => {
  try {
    wisdom = await folkWisdom.wisdom();

    res.render("vanasona", { wisdom });
  } catch (err) {
    res.render("vanasona", { wisdom: "Ei leidnud uhtegi vanasona" });
  }
});

app.get("/regvisit", (req, res) => {
  res.render("regvisit");
});

app.post("/regvisit", async (req, res) => {
  try {
    await fs.open(regTextRef, "a");
    await fs.appendFile(regTextRef, req.body.nameInput + ";");
    res.render("regvisit");
  } catch (err) {
    console.log(err);
    res.render("regivsit");
  }
});

app.listen(PORT);
