/* importing package dependencies */
require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/* importing local dependencies */
const Register_Schema = require("../models/Register_Schema");
const { authenticateToken } = require("../controllers/authenticateToken");
const { dbService } = require("../middleware/dbHandler");

/****************************Swagger documentation**********************/
/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterSchema:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - pass
 *       properties:
 *         name:
 *           type: string
 *           description: name of the user
 *         email:
 *           type: string
 *           description: email of the user
 *         pass:
 *           type: string
 *           description: password of the user
 *       example:
 *         name: Jim
 *         email: jim@email.com
 *         pass: Password
 *   securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: user operations
 */

//view all users (live)
router.get("/", async (req, res, next) => {
  try {
    let Site_Schema = await dbService.returnDbSchema(req.headers, "sites", siteSchema);
    let sites_list = await dbService.getSitesId(req.headers);

    const users = await Register_Schema.find({ sites: { $in: sites_list }, is_active:true }).sort({
      createdAt: -1,
    });
    if (!users) {
      return res.sendStatus(204);
    } else {
      res.status(200).json(users);
    }
  } catch (err) {
    next(err);
  }
});

//view single user by ID (live)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await Register_Schema.findById(req.params.id);
    if (!user) {
      return res.sendStatus(204);
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /register/createuser:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterSchema'
 *     responses:
 *       200:
 *         description: The user successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterSchema'
 *       500:
 *         description: Some server error
 */

//create new user (with password local)
router.post("/createuser", async (req, res, next) => {
  try {
    const password = req.body.pass;
    let hashedPassword = await bcrypt.hash(password, 10);
    const register_schema = new Register_Schema({
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      email: req.body.email,
      country_code: req.body.country_code,
      mobile_number: req.body.mobile_number,
      department: req.body.department,
      designation: req.body.designation,
      pass: hashedPassword,
      role: req.body.role,
      subscriber_id: req.body.subscriber_id,
      db_name: req.body.db_name,
      sites: req.body.sites,
      is_active: true,
      created_by: req.body.created_by,
    });
    const newUser = await register_schema.save();
    if (!newUser) {
      return res.sendStatus(204);
    } else {
      res.status(200).json(newUser);
    }
  } catch (err) {
    next(err);
  }
});

//view all user (live)
router.post("/viewuser", async (req, res, next) => {
  try {
    var Filteruser = req.body.email;
    const getUser = await Register_Schema.findOne({ email: Filteruser, is_active:true }).sort({
      createdAt: -1,
    });
    if (getUser.length === 0) {
      return res.sendStatus(204);
    } else {
      res.status(200).json({
        first_name: getUser.first_name,
        middle_name: getUser.middle_name,
        last_name: getUser.last_name,
        email: getUser.email,
        country_code: getUser.country_code,
        mobile_number: getUser.mobile_number,
        department: getUser.department,
        designation: getUser.designation,
        role: getUser.role,
        subscriber_id: getUser.subscriber_id,
        sites: getUser.sites,
        is_active: getUser.is_active,
      });
    }
  } catch (error) {
    next(err);
  }
});


// update firebase token in users table (live)
router.post("/fcm", async (req, res, next) => {
  var fcm = req.body.fcm;
  var email = req.body.email;
  try {
    let isExistUser = await Register_Schema.find({ email: email, is_active:true });
    if (isExistUser.length === 0) {
      return res.sendStatus(204);
    } else {
      //updating user table
      const filterPass = { email: email };
      const updatePassDocument = {
        $set: {
          fcm_token: fcm,
        },
      };
      const updateFcm = await Register_Schema.updateOne(
        filterPass,
        updatePassDocument
      );
      !updateFcm ? res.sendStatus(204) : res.status(200).json("fcm updated");
    }
  } catch (err) {
    next(err);
  }
});

/*exporting module for the global usage */
module.exports = router;
