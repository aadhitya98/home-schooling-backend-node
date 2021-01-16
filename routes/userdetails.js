const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const User = require("../model/User");

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
        const { username, password, email, phonenumber } = req.body;
        try {
            let user = await User.findOne({
                username
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
                phonenumber
            });
            const salt = await bcrypt.genSalt(15);
            user.password = await bcrypt.hash(password, salt)
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

            const isCorrect = await bcrypt.compare(password, user.password);
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
                        token
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Something went wrong!"
            });
        }
    }
);

router.get("/loggedin", auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in getting user details" });
    }
});
// INFO  @Akash and @Bhujith... To test this loggedin api... Kindly first test login/signup api in postman and a token will be generated...Now test this /api/loggedin by adding the token in the headers section( no body request needed)
module.exports = router;