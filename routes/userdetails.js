const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var cryptojs = require('crypto-js');
// var logger = require('logger').createLogger();
const User = require("../model/User");
const { writer } = require("repl");

router.post("/signup", [
        check("username", "Username is mandatory")
        .not()
        .isEmpty(),
        check("email", "Email is mandatory")
        .isEmail(),
        check("password", "Password is mandatory").isLength({
            min: 8
        }),
        check("phonenumber", "Phone Number is mandatory").isLength({
            min: 10,
            max: 15
        })
    ],
    async(req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty) {
            return res.status(400).json({
                error: error.array()
            });
        }
        const { username, password, email, phonenumber, createdUser } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    message: "User already exists"
                });
            }
            user = new User({
                username,
                password,
                email,
                phonenumber,
                createdUser
            });

            await user.save();
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(payload, "bearer", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log("Error", err.message);
            res.status(500).send("Error in Storing the details to the DB");
        }
        console.info('Sign up api called');

    }
);

router.post(
    "/login", [
        check("email", "Please enter a valid email-id").not().isEmpty(),
        check("password", "Please enter a valid password").isLength({
            min: 8
        })
    ],
    async(req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (!user)
                return res.status(400).json({
                    message: "Email Not Exists"
                });

            const decryptWithAES = cryptojs.AES.decrypt(password, '123')
            const originalText = decryptWithAES.toString(cryptojs.enc.Utf8);

            const isCorrect = await bcrypt.compare(originalText, user.password);
            if (!isCorrect)
                return res.status(400).json({
                    message: "Incorrect Password"
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "bearer", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token,
                        "User": user.role
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Something went wrong!"
            });
        }
        console.info('login Api called');

    }

);

router.get("/loggedin", auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in getting user details" });
    }
    console.info('User Logged In');

});
// INFO  @Akash and @Bhujith... To test this loggedin api... Kindly first test login/signup api in postman and a token will be generated...Now test this /api/loggedin by adding the token in the headers section( no body request needed)

router.post('/forgotpassword', function(req, res, next) {
    async.waterfall([
            function(done) {
                crypto.randomBytes(30, function(error, buffer) {
                    var token = buffer.toString('hex');
                    done(error, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        return res.status(400).json({
                            message: "No User of this email exists."
                        });
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000;
                    user.save(function(err) {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            })
                        }
                        done(err, token, user)
                        return res.status(200).json({
                            resetPasswordToken: user.resetPasswordToken,
                            message: "An email with the reset password link will be sent.Please check your email-id"
                        })

                    });
                });
            },
            function(token, user, done) {
                var smtptrans = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'homeschooling260119@gmail.com',
                        pass: 'tn58ac8308'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'homeschooling260119@gmail.com',
                    subject: 'Password Reset for HomeSchooling',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser\n\n' +
                        'http://localhost:4200/api/resetpassword/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtptrans.sendMail(mailOptions, function(err) {
                    done(err, 'done');
                });
            }

        ],
        function(err) {
            if (err)
                return next(err);
        }

    )
    console.info('Forgot Password api called');

});


router.post("/resetpassword/:token", function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    return res.status(400).json({
                        message: "No User of this email exists."
                    });
                }
                const salt = bcrypt.genSalt(15);
                // user.password =  bcrypt.hash(req.body.password, salt);
                // user.password = req.body.password;
                // bcrypt.genSalt(12, (err, salt) => {
                //     bcrypt.hash(req.body.password, salt, (err, hash) => {
                //         user.password = req.body.password;
                //     });
                // });
                // return bcrypt.hash(req.body.password, 15, (err, hash) => {
                //             if (err) {
                //                 return res.status(400)
                //                     .json({ message: 'Error hashing' })
                //             } else {
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    if (err) {
                        return res.status(500).send({
                            msg: err.message
                        })
                    }
                    done(err, user);
                    return res.status(200).json({
                        message: "Your password is successfully changed"
                    })
                });


            });
        },
        function(user, done) {
            var smtpTrans = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'homeschooling260119@gmail.com',
                    pass: 'tn58ac8308'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'homeschooling260119@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTrans.sendMail(mailOptions, function(err) {
                done(err);
            });
        }
    ], function(err) {
        console.log('Error', err);
    });
    console.info('Reset password done');

});
module.exports = router;