const express = require('express'),
	morgan = require('morgan'),
	fs = require('fs'), //import built-in node modules fs and path
	path = require('path'),
	uuid = require('uuid'),
	mongoose = require('mongoose'),
	Models = require('./models.js'),
	{ check, validationResult } = require('express-validator'),
	dotenv = require('dotenv').config();

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genres;

//Local Database
// mongoose.connect('mongodb://localhost:27017/cfDB', {
//     useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const app = express();

//'log.txt' file created in root
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
	flags: 'a',
});
//Parser/Handling
const bodyParser = require('body-parser'),
	methodOverride = require('method-override');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

const cors = require('cors');
app.use(cors());

// app.use((req, res, next) => {
// 	res.header({ 'Access-Control-Allow-Origins': '*' });
// 	next();
// });

//Authentication import
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(bodyParser.json());
app.use(methodOverride());

//setup Logger
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public')); //routes all requests for static files to their reapective files on the server

//Home Page
app.get('/', (req, res) => {
	let responseText = 'Welcome to myFlix! Millennial Movies ';
	// responseText += '<small>Requested at: ' + req.requestTime + '</small>';
	res.send(responseText);
});

//Documentation Page
app.get('/documentation.html', (req, res) => {
	res.sendFile('public/documentation.html', { root: __dirname });
});

//MOVIE ENDPOINTS
//READ ALL movies
app.get(
	'/movies',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.find()
			.then((movies) => {
				res.status(201).json(movies);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//READ description of movie by title
app.get(
	'/movies/:Title',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.findOne({ Title: req.params.Title})
			.then((movie) => {
				res.json(movie);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//READ all genres
app.get(
	'/genres',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Genres.find()
			.then((genres) => {
				res.json(genres);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//GET movies by genre
app.get(
	'/movies/Genre/:Name',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.find({ 'Genre.Name': req.params.Name })
			.then((movieGenres) => {
				if (!movieGenres) {
					return res
						.status(404)
						.send('Error: ' + req.params.Name + ' was not found.');
				} else {
					res.status(200).json(movieGenres);
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//READ data about a dircetor by name
app.get(
	'/movies/director/:Name',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.findOne({ 'Director.Name': req.params.Name })
			.then((movie) => {
				if (!movie) {
					return res
						.status(404)
						.send('Error: ' + req.params.Name + ' was not found.');
				} else {
					res.status(200).json(movie.Director);
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//USER ENDPOINTS
//CREATE new user
/* Expect JSON in the format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
const allowedDomains = '*';
app.post(
	'/users',
	[
		check('Username', 'Username is required').isLength({ min: 4 }),
		check(
			'Username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	cors({
		origin: allowedDomains,
		credentials: true,
	}),
	async (req, res) => {
		//check validation object
		let errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		console.log('User created');
		let hashedPassword = Users.hashPassword(req.body.Password);
		await Users.findOne({ Username: req.body.Username })
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.Username + ' already exists');
				} else {
					Users.create({
						Username: req.body.Username,
						Password: hashedPassword,
						// Password: req.body.Password,
						Email: req.body.Email,
						Birthday: req.body.Birthday,
					})
						.then((user) => {
							res.status(201).json(user);
						})
						.catch((error) => {
							console.error(error);
							res.status(500).send('Error: ' + error);
						});
				}
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

//READ all users
app.get(
	'/users',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		//Condition Check
		if (req.user.Username != req.params.Username) {
			return res.status(400).send('Permission denied');
		}
		//End Condition
		await Users.find()
			.then((users) => {
				res.status(201).json(users);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + err);
			});
	}
);

//GET a user by username
app.get(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		//Condition Check
		if (req.user.Username !== req.params.Username) {
			return res.status(400).send('Permission denied');
		}
		//End Condition
		await Users.findOne({ Username: req.params.Username })

			.then((user) => {
				res.json(user);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);
//UPDATE user info (username)
/*Expect Json:
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
} */
app.put(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	[
		check('Username', 'Username is required').isLength({ min: 5 }),
		check(
			'Username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
	],
	async (req, res) => {
		//Conditions Check
		if (req.user.Username !== req.params.Username) {
			return res.status(400).send('Permission denied');
		}

		let errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		//End Conditions
		let hashedPassword = Users.hashPassword(req.body.Password);
		await Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
		
				$set: {
					Username: req.body.Username,
					Password: hashedPassword,
					Email: req.body.Email,
					Birthday: req.body.Birthday,
				},
			},
			{ new: true }
		) //Makes sure the updated document is returned
			.then((updatedUser) => {
				res.json(updatedUser);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//UPDATE movie to user's favoriteMovies. Consider using "$addToSet" instead of "$push"
app.post(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	// [
	//     check('Username', 'Username is required').isLength({min: 5}),
	//     check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
	//     check('Username', 'Username is required').not().isEmpty()
	// ],

	async (req, res) => {
		//Condition Check
		if (req.user.Username != req.params.Username) {
			return res.status(400).send('Permission denied');
		}

		let errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		//End Condition
		await Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$addToSet: { FavoriteMovies: req.params.Title },
			},
			{ new: true }
		) //Makes sure updated document is returned
			.then((updatedUser) => {
				if (!updatedUser) {
					return res.status(404).send('Unable to update.');
				} else {
					res.json(updatedUser);
				}
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

//DELETE movie from user favoriteList. Same as add, but use $pull
app.delete(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		//Condition Check
		if (req.user.Username != req.params.Username) {
			return res.status(400).send('Permission denied');
		}
		//End Condition
		await Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$pull: { FavoriteMovies: req.params.MovieID },
			},
			{ new: true }
		)
			.then((removeMovie) => {
				res.json(removeMovie);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//DELETE user, return text that user email has been removed
app.delete(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		//Condition Check
		if (req.user.Username != req.params.Username) {
			return res.status(400).send('Permission denied');
		}
		//End Condition
		await Users.findOneAndRemove({ Username: req.params.Username })
			.then((user) => {
				if (!user) {
					res.status(400).send(req.params.Username + ' was not found');
				} else {
					res.status(200).send(req.params.Username + ' was deleted.');
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

//error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// app.listen(8080, () => {
//     console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});
