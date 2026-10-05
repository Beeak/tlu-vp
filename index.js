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

app.use(express.urlencoded({ extended: false }));

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

app.get("/lastvisit", async (req, res) => {
  const visits = (await fs.readFile(regTextRef, "utf8")).split(";");
  const [name, date, time] = visits[visits.length - 2].split(",");

  res.render("lastvisit", {
    lastVisit: `Viimati registreeriti külastus ${date}, kell ${time} kui seda tegi ${name}`,
  });
});

app.get("/info", (req, res) => {
  res.render("info");
});

app.post("/regvisit", async (req, res) => {
  try {
    const dateNow = dateET.fullDate();
    const timeNow = dateET.fullTime();

    await fs.open(regTextRef, "a");
    await fs.appendFile(
      regTextRef,
      req.body.nameInput + "," + dateNow + "," + timeNow + "," + ";",
    );
    res.render("regvisit");
  } catch (err) {
    console.log(err);
    res.render("regvisit");
  }
});

app.listen(PORT);
