'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here using the userID foreign key
      // Add a one-to-one association between the Course and User models using the belongsTo() method.
      Course.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  Course.init(
    {
      title: {
        type: DataTypes.STRING,
        // title is required
        allowNull: false,
        // validation message for empty field
        validate: {
          notEmpty: {
            msg: 'Title is a required field'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        // description is required
        allowNull: false,
        // validation message for empty field
        validate: {
          notEmpty: {
            msg: 'Description is a required field'
          }
        }
      },
      estimatedTime: { type: DataTypes.STRING, allowNull: true },
      materialsNeeded: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Course'
    }
  );
  return Course;
};
