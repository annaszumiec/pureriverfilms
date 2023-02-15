const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

// Express validator
const { check, validationResult } = require('express-validator');


//Conect to mongoDB
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/cfDB')


// mongoose.connect( 'mongodb+srv://myska:szumiec@pureriverfilms.irczgb7.mongodb.net/?retryWrites=true&w=majority' , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

//Middleware & static files

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.use(express.static("public"));
//log request to server
app.use(morgan("common"));

//GET request
app.get("/", (req, res) => {
  res.send("Hallo Bless");
});

// CREATE/ Post in Mongoose
//Add new user
app.post(
  "/users",
  [
    check(
      "Username",
      "Username is required and minimun length is 5 characters."
    ).isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error" + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error" + error);
      });
  }
);

// Add a movie to a user's list of favorites

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// READ/ get
//Get all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// Get directors

app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Directors.find()
      .then((directors) => {
        res.status(201).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get genre

app.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Genres.find()
      .then((genres) => {
        res.status(201).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


// Movies by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// All users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// User by name
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const username = req.params.Username;
    Users.findOne({ Username: username })
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// User by id
app.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ id: req.params.id })
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Movie by director name
app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Movie by genre
app.get(
  "/movies/genres/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

//Update/ Put
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Delete User
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//App-listener
app.listen(4000, () => console.log('server started)'))


// const port = process.env.PORT || 8080;
// app.listen(port, "0.0.0.0", () => {
//   console.log(" Listening on Port " + port);
// });
