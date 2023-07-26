/* importing package dependencies */
require("dotenv").config();
const express = require("express");
const router = express.Router();
/* importing local dependencies */
const Register_Schema = require("../models/Register_Schema");

/****************************Swagger documentation**********************/
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout from the portal
 *     security:
 *          - bearerAuth: []
 *     tags: [Authenticate]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         contents:
 *           application/json:
 *       204:
 *         description: No content
 */

//Logout (live)
router.get("/", async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //no content
    const refreshToken = cookies.jwt;
    //check is refresh token in db?
    const foundUser = await Register_Schema.findOne({
      refresh_token: refreshToken,
    }).exec();
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: process.env.secureFlag,
      }); //, secure: true
      return res.sendStatus(204);
    }
    const deletert = {
      $set: {
        refresh_token: "",
      },
    };
    const deletetoken = await Register_Schema.updateOne(
      { refresh_token: refreshToken },
      deletert
    );
    if (deletetoken.modifiedCount !== 0) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: process.env.secureFlag,
      }); //, secure:true
      res.status(200).send("logout successful");
    }
  } catch (err) {
    next(err);
  }
});

/*exporting module for the global usage */
module.exports = router;
