const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const sqlquery = `SELECT * FROM state`;
  const playerarray = await db.all(sqlquery);
  response.send(playerarray.map((sea) => convertDbObjectToResponseObject(sea)));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const sqlquer = `SELECT * FROM state WHERE state_id = ${stateId}`;
  const playerarra = await db.get(sqlquer);
  response.send(convertDbObjectToResponseObject(playerarra));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const mysqcomm = `
  INSERT INTO
    district (district_name,state_id,cases,cured,active,deaths)
  VALUES
    ('${districtName}', ${stateId}, ${cases}, ${cured} ,${active},${deaths});`;

  const playerinsert = await db.run(mysqcomm);
  response.send("Player Added to Team");
});
