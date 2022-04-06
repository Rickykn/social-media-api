const { Op } = require("sequelize");
const { User, VerificationToken } = require("../lib/sequelize");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../lib/jwt");
const mailer = require("../lib/mailer");
const mustache = require("mustache");
const fs = require("fs");
const { nanoid } = require("nanoid");
const moment = require("moment");

const authControllers = {
  registerUser: async (req, res) => {
    try {
      // 1. Check apakah username/email sudah digunakan
      // 2. Register user
      const { username, email, full_name, password } = req.body;

      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username or email has been taken",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      const newUser = await User.create({
        username,
        email,
        full_name,
        password: hashedPassword,
      });

      //verification email
      const verificationToken = generateToken(
        {
          id: newUser.id,
          isEmailVerification: true,
        },
        "1h"
      );

      const verificationLink = `https://localhost:2022/auth/verify/${verificationToken}`;

      const templates = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(templates, {
        username,
        verify_url: verificationLink,
      });

      await mailer({
        to: email,
        subject: "Verify your account",
        html: renderedTemplate,
      });

      return res.status(201).json({
        message: "Registered user",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      const findUser = await User.findOne({
        where: {
          username,
        },
      });

      if (!findUser) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      delete findUser.dataValues.password;

      const token = generateToken({
        id: findUser.id,
        role: findUser.role,
      });

      // await mailer({
      //   to: "rickyyyyykn25@gmail.com",
      //   subject: "Logged in account",
      //   text: "An account using your email has logged in",
      // });

      return res.status(200).json({
        message: "Logged in user",
        result: {
          user: findUser,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  keepLogin: async (req, res) => {
    // Terima token
    // Check kalau token valid
    // Renew token
    // Kirim token + user data
    try {
      const { token } = req;

      const renewedToken = generateToken({ id: token.id });

      const findUser = await User.findByPk(token.id);

      delete findUser.dataValues.password;

      return res.status(200).json({
        message: "Renewed user token",
        result: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  verifyUser: async (req, res) => {
    try {
      const { token } = req.params;
      const isTokenVerified = verifyToken(token);

      if (!isTokenVerified || !isTokenVerified.isEmailVerification) {
        res.status(400).json({
          message: "Invalid Token",
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: isTokenVerified.id,
          },
        }
      );

      return res.status(200).json({
        message: "user verified",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "server error",
      });
    }
  },
  resendVerify: async (req, res) => {
    try {
      const { token } = req;

      const findUser = await User.findByPk(token.id);
      if (findUser.is_verified) {
        return res.status(400).json({
          message: "User is already verified",
        });
      }
      const verificationToken = generateToken(
        {
          id: token.id,
          isEmailVerification: true,
        },
        "1h"
      );

      const verificationLink = `https://localhost:2022/auth/verify/${verificationToken}`;

      await mailer({
        to: findUser.email,
        subject: "Verify your account",
        html: `Your account has been registered,please verify it by clicking this <a href="${verificationLink}">link</a>`,
      });

      return res.status(200).json({
        message: "resend success",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  registerUserV2: async (req, res) => {
    try {
      // 1. Check apakah username/email sudah digunakan
      // 2. Register user
      const { username, email, full_name, password } = req.body;

      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username or email has been taken",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      const newUser = await User.create({
        username,
        email,
        full_name,
        password: hashedPassword,
      });

      // Verification email
      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        user_id: newUser.id,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
      });

      const verificationLink = `http://localhost:2020/auth/v2/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink,
        full_name,
      });

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return res.status(201).json({
        message: "Registered user",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  verifyUserV2: async (req, res) => {
    try {
      const { token } = req.params;
      console.log(token);

      const findToken = await VerificationToken.findOne({
        where: {
          token,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc(),
          },
        },
      });

      if (!findToken) {
        return res.status(400).json({
          message: "Your token is invalid",
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: findToken.user_id,
          },
        }
      );

      findToken.is_valid = false;
      findToken.save();

      return res.redirect(
        `http://localhost:3000/verification-success?referral=${token}`
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  resendVerifyV2: async (req, res) => {
    try {
      const { token } = req;

      const findUser = await User.findByPk(token.id);

      await VerificationToken.update(
        { is_valid: false },
        { where: { user_id: findUser.id } }
      );

      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        user_id: findUser.id,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
      });

      const verificationLink = `http://localhost:2020/auth/v2/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: verificationLink,
      });

      await mailer({
        to: findUser.email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });
    } catch (err) {}
  },
};

module.exports = authControllers;
