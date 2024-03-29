const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'), 
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256',
        //algorithm used to "sign" or encode the values for the JWT
    });
}

/* POST login */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        console.log("Login Function", req.user);
        passport.authenticate('local', {session: false}, 
        (error, user, info) => {
            console.log(user);
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user,
                    error: error
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
};