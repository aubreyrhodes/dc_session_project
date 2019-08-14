'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING
  }, {});
  user.associate = function (models) {
    user.hasMany(models.message);
  };
  return user;
};