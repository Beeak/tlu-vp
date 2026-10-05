const express = require("express");
const fs = require("fs").promises;

//moodul URL-i lahtiharutamiseks, et saaks POST osad ka katte
// const bodyparser = require("body-parser");

//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require("mysql2/promise");

const dateET = require("./src/dateTimeET");
const folkWisdom = require("./src/folkWisdom");

//moodul .env faili lugemiseks, keskkonnamuutujate parisimiseks
require("dotenv").config();

const regTextRef = "public/txt/visits.txt";

const PORT = 5021;
// kaivitan express.js functioni ning annan nimeks "app"
const app = express();

//maarame veebilehtedele mallide renderdamise mootori
app.set("view engine", "ejs");

//maaran uhe paris kataloogi virtuaalses serveris kattesaadavaks
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

//loon andmebaasiuhenduse
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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

app.get("/eestifilm", (req, res) => {
  res.render("eestifilm");
});

app.get("/eestifilm/inimesed", async (req, res) => {
  try {
    const sqlReq = "SELECT * FROM person ORDER by last_name";
    const [sqlRes] = await (await conn).execute(sqlReq);
    console.log(sqlRes);
    res.render("eestifilminimesed", { personList: sqlRes });
  } catch (err) {
    console.log("Viga andmebaasist lugemisel: " + err);
    res.render("eestifilminimesed", { personList: [] });
  } finally {
    if (conn) {
      (await conn).end;
    }
  }
});

app.get("/eestifilm/inimesed/add", (req, res) => {
  res.render("eestifilminimesed_add", { notice: "Ootan sisestust!" });
});

app.post("/eestifilm/inimesed/add", async (req, res) => {
  console.log(req.body);
  if (
    !req.body.firstNameInput ||
    !req.body.lastNameInput ||
    !req.body.bornInput ||
    req.body.bornInput >= new Date()
  ) {
    console.log("Andmed pole korrektsed");
    return res.render("eestifilminimesed_add", {
      notice: "Andmed on puudulikud!",
    });
  }
  try {
    await conn;
    let sqlReq =
      "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?, ?, ?, ?)";
    let deceasedDate = null;
    if (req.body.deceasedInput != "") {
      deceasedDate = req.body.deceasedInput;
    }
    (await conn).execute(sqlReq, [
      req.body.firstNameInput,
      req.body.lastNameInput,
      req.body.bornInput,
      deceasedDate,
    ]);
    res.render("eestifilminimesed_add", {
      notice: "Tekkis viga, andmed salvestati!",
    });
  } catch (err) {
    console.log("Viga andmebaasiga suhtlemisel: " + err);
    res.render("eestifilminimesed_add", {
      notice: "Tekkis viga, andmeid ei salvestatud!",
    });
  } finally {
    if (conn) {
      (await conn).end;
    }
  }
});

app.listen(PORT);
