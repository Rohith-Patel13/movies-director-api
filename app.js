const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let dbPath = path.join(__dirname, "moviesData.db");
let dbConnectionObject = null;
const initializeDBandServer = async () => {
  try {
    dbConnectionObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server starts at port number 3001");
    });
  } catch (error) {
    console.log(`ERROR : ${error.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

//APIs For Movie Table :

//API 1 Movies:
app.get("/movies/", async (requestObject, responseObject) => {
  //const requestBody = requestObject.body;
  //console.log(requestBody);//{}
  const moviesQuery = `SELECT movie_name FROM movie;`;
  const dbResponse = await dbConnectionObject.all(moviesQuery);
  //console.log(dbResponse);//array of objects as output
  const dbResponseResult = dbResponse.map((eachObject) => {
    return {
      movieName: eachObject.movie_name,
    };
  });
  responseObject.send(dbResponseResult);
});

//API 2 Movies:
app.post("/movies/", async (requestObject, responseObject) => {
  const requestBody = requestObject.body;
  /*
  console.log(requestBody);
   {
      directorId: 6,
      movieName: 'Jurassic Park',
      leadActor: 'Jeff Goldblum'
    }
  */
  const { directorId, movieName, leadActor } = requestBody;
  const moviesQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}')
  `;
  await dbConnectionObject.run(moviesQuery);
  responseObject.send("Movie Successfully Added");
});

//API 3 Movies:
app.get("/movies/:movieId/", async (requestObject, responseObject) => {
  const movieIdObject = requestObject.params;
  //console.log(movieIdObject);//{ movieId: '46'}
  const { movieId } = movieIdObject;
  //const requestBody = requestObject.body;
  //console.log(requestBody);//{}
  const moviesQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const dbResponse = await dbConnectionObject.get(moviesQuery);
  //console.log(dbResponse);
  const dbResponseResult = {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
  responseObject.send(dbResponseResult);
});

//API 4 Movies:
app.put("/movies/:movieId/", async (requestObject, responseObject) => {
  const requestBody = requestObject.body;
  /*
  console.log(requestBody);
  {
  directorId: 24,
  movieName: 'Thor',
  leadActor: 'Christopher Hemsworth'
  }*/
  const { directorId, movieName, leadActor } = requestBody;
  const movieIdObject = requestObject.params;
  //console.log(movieIdObject);//{ movieId: '50' }
  const { movieId } = movieIdObject;
  const moviesQuery = `
  UPDATE movie SET director_id=${directorId},movie_name='${movieName}',
  lead_actor='${leadActor}' WHERE movie_id=${movieId};
  `;
  const dbResponse = await dbConnectionObject.run(moviesQuery);
  console.log(dbResponse);
  responseObject.send("Movie Details Updated");
});

//API 5 Movies:
app.delete("/movies/:movieId/", async (requestObject, responseObject) => {
  const movieIdObject = requestObject.params;
  //console.log(movieIdObject);//{ movieId: '116' }
  const { movieId } = movieIdObject;
  const moviesQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await dbConnectionObject.run(moviesQuery);
  responseObject.send("Movie Removed");
});

//API 6 Directors:
app.get("/directors/", async (requestObject, responseObject) => {
  const directorQuery = `SELECT * FROM director;`;
  const dbResponse = await dbConnectionObject.all(directorQuery);
  const dbResponseResult = dbResponse.map((eachObject) => {
    return {
      directorId: eachObject.director_id,
      directorName: eachObject.director_name,
    };
  });
  responseObject.send(dbResponseResult);
});

//API 7 Directors:
app.get(
  "/directors/:directorId/movies/",
  async (requestObject, responseObject) => {
    /*
    console.log(requestObject);
    <ref *2> IncomingMessage {
        ...
        ...
        ...
        params: { directorId: '13' },
        ...
        ...
        ...
    }
    */
    const directorIdValue = requestObject.params.directorId; //output: 13

    const directorQuery = `SELECT movie.movie_name
                         FROM movie
                         INNER JOIN director
                         ON movie.director_id = director.director_id
                         WHERE director.director_id = ${directorIdValue};`;
    const dbResponse = await dbConnectionObject.all(directorQuery);
    const dbResponseResult = dbResponse.map((eachObject) => {
      return {
        movieName: eachObject.movie_name,
      };
    });
    responseObject.send(dbResponseResult);
  }
);

module.exports = app;
