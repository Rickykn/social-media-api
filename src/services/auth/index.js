const { User } = require("../../lib/sequelize");
const Service = require("../service");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { generateToken } = require("../../lib/jwt");
const UserService = require("../user");

class AuthService extends Service {
  static loginUser = async (req, res) => {
    try {
      const { username, password } = req.body;

      const findUser = await User.findOne({
        where: {
          username
        }
      });

      if (!findUser) {
        return this.handleClientError(res, {
          message: "Wrong username or password"
        })
      }

      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password)

      if (!isPasswordCorrect) {
        return this.handleClientError(res, {
          message: "Wrong username or password"
        })
      }

      delete findUser.dataValues.password

      const token = generateToken(
        {
          id: findUser.id,
          role: findUser.role
        }
      )

      return this.handleSuccess(res, {
        message: "Logged in user",
        data: {
          user: findUser,
          token
        }
      })

    } catch (err) {
      return this.handleServerError(res, err)
    }
  }

  static registerUser = async (req, res) => {
    // Kirim email
    // Kirim SMS

    await UserService.createNewUser();
  }
}

module.exports = AuthService