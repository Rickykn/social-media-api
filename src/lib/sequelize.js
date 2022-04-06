const { Sequelize } = require("sequelize");
const mysqlConfig = require("../configs/database");

const sequelize = new Sequelize({
  username: mysqlConfig.MYSQL_USERNAME,
  password: mysqlConfig.MYSQL_PASSWORD,
  database: mysqlConfig.MYSQL_DB_NAME,
  port: 3306,
  dialect: "mysql",
  // logging: (sql) => {
  //   console.log("SQL AKUUU", sql)
  //   fs.appendFileSync(__dirname + "/sql_logs.txt", sql)
  // }
  logging: false
})

// Models
const Post = require("../models/post")(sequelize);
const User = require("../models/user")(sequelize);
const Like = require("../models/like")(sequelize);

// Associations
// 1 : M
Post.belongsTo(User, { foreignKey: "user_id", as: "user_post" })
User.hasMany(Post, { foreignKey: "user_id", as: "user_post" })

// M : M
Post.belongsToMany(User, { through: Like, foreignKey: "post_id", as: "user_likes" })
User.belongsToMany(Post, { through: Like, foreignKey: "user_id", as: "user_likes" })
User.hasMany(Like, { foreignKey: "user_id" })
Like.belongsTo(User, { foreignKey: "user_id" })
Post.hasMany(Like, { foreignKey: "post_id" })
Like.belongsTo(Post, { foreignKey: "post_id" })

module.exports = {
  sequelize,
  Post,
  User,
  Like
}