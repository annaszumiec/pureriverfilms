const mongoose = require('mongoose');
const uuid = require('uuid');
const bcrypt = require('bcrypt');


let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
      Name: String,
      Description: String
    },
    Director: {
      Name: String,
      Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
  });
  
  let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });

  let directorSchema = mongoose.Schema({
    Name: String,
    Bio: String
    });

  let genreSchema = mongoose.Schema({
      Name: String,
      Description: String
  });
  
  userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password,5);
  };
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

//create collections: movies,users

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);
let Genre = mongoose.model('Genre', genreSchema);

  //exporting the Models
  module.exports.Movie = Movie;
  module.exports.User = User;
  module.exports.Director = Director;
  module.exports.Genre = Genre;
