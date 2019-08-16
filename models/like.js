'use strict';
module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    userId: DataTypes.INTEGER,
    messageId: DataTypes.INTEGER
  }, {});
  like.associate = function(models) {
    like.belongsTo(models.user);
    like.belongsTo(models.message);
  };
  return like;
};