'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    firstName: DataTypes.STRING
  }, {});
  user.associate = function (models) {
    user.hasMany(models.message);
    user.belongsToMany(models.message, {through: 'like'});
  };
  return user;
};