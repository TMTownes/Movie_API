const passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');



let Users = Models.User,
JwtStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;


//Take username/password from request body and use Mongoose to check database
//Request is made from URL endpoint (params NOT body)
passport.use(
    new LocalStrategy(
        { usernameField: 'Username',
        passwordField: 'Password'
    },
    async (username, password, callback) => {
        console.log('HERE');
        console.log(`${username} ${password}`);
        await Users.findOne({Username: username})
        .then((user) => {
            if (!user) {
                console.log('incorrect username');
                return callback(null, false, {
                    message: 'Incorrect username or password.',
                });
            }
            if (!user.validatePassword(password)){
                console.log('incorrect password');
                return callback(null, false, {message: 'Incorrect password.'});
            }
            console.log('finished');
            return callback(null, user);
        })
        .catch((error) => {
            if (error) {
                console.log(error);
                return callback(error);
            }
        })
    }
  )
);

//Authenticate users based on JWT submitted with requests
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
}));