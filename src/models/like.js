const { DataTypes } = require("sequelize");

const Like = (sequelize) => {
  return sequelize.define(
    "Like",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      }
    }
  )
}

module.exports = Like;