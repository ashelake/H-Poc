const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/* importing local dependencies */
const Register_Schema = require("../models/Register_Schema");
const { authenticateToken } = require("../controllers/authenticateToken");

/****************************Swagger documentation**********************/
/**
 * @swagger
 * tags:
 *   name: Login
 *   description: Login operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginSchema:
 *       type: object
 *       required:
 *         - email
 *         - pass
 *       properties:
 *         email:
 *           type: string
 *           description: email of the user
 *         pass:
 *           type: string
 *           description: password of the user
 *       example:
 *         email: jim@email.com
 *         pass: Password
 *   securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: login by using user credentials
 *     tags: [Authenticate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginSchema'
 *     responses:
 *       200:
 *         description: The user logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSchema'
 *       500:
 *         description: server error
 */

//login (live)
router.post("/", async (req, res, next) => {

  const user = await Register_Schema.find(
    { email: req.body.email }, { email: 1, first_name: 1, last_name: 1, role: 1, pass: 1 }
  );
  // console.log("user[0].db_name",user[0].db_name)
  var data = await Register_Schema.find({ email: req.body.email });
  if (user.length == 0) return res.sendStatus(204);
  try {
    if (await bcrypt.compare(req.body.pass, user[0].pass)) {
      const accessToken = generateAccessToken(user[0].toJSON(),);
      const refreshToken = jwt.sign(
        user[0].toJSON(),
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const updatetokenDocument = {
        $set: {
          refresh_token: refreshToken,
        },
      };
      const updatetoken = await Register_Schema.updateOne(
        { email: req.body.email },
        updatetokenDocument
      );
      //create secure cookie with refresh token //, secure: true
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.secureFlag,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        status: "Success",
        accessToken: accessToken,
        email: user[0].email,
        department: user[0].department,
        userid: data[0]._id,
        role: data[0].role,
        fcm_token: data[0].fcm_token,
        subscriber_id: data[0].subscriber_id,
      });
    } else res.status(401).send("Not allowed");
  } catch (err) {
    next(err);
  }
});

// Generate access Token : (live)
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "200m" });
}

module.exports = router