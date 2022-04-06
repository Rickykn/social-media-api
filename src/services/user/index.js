const { User } = require("../../lib/sequelize");
const Service = require("../service");

class UserService extends Service {
  static getAllUsers = async (req) => {
    try {
      const findUsers = await User.findAll({
        where: {
          ...req.query
        }
      });

      if (!findUsers.length) {
        return this.handleError({
          message: "No users found",
          statusCode: 400
        })
      }

      return this.handleSuccess({
        message: "Find all users",
        data: findUsers
      })
    } catch (err) {
      return this.handleError()
    }
  }

  static createNewUser = async (req) => {
    try {
      const { username } = req.body;

      const findUserWithUsername = await this.getAllUsers({
        query: {
          username
        }
      })

      if (!findUserWithUsername.success) return this.handleError();

      // Check apakah username sudah pernah digunakan
      if (findUserWithUsername.success && findUserWithUsername.data.length) {
        return this.handleError({
          message: "username has been used",
          statusCode: 400
        })
      }

      await User.create({
        username
      })

      return this.handleSuccess({
        message: "Created user",
        statusCode: 201
      })
    } catch (err) {
      return this.handleError();
    }
  }
}

module.exports = UserService