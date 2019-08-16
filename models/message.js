'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    subject: DataTypes.STRING,
    body: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  message.associate = function (models) {
    message.belongsTo(models.user);
    message.belongsToMany(models.user, {through: 'like', as: 'likedUsers'});
  };
  return message;
};