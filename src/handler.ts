"use strict";
import { Sequelize, DataTypes } from "sequelize";
import { createResponse } from "./util/response-handler";
require("pg");

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/postgres`,
  {
    dialect: 'postgres'
  }
);

const Food = sequelize.define(
  "food",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);
Food.removeAttribute('id');

sequelize
  .authenticate()
  .then(() => console.log("Connection made"))
  .catch((err) => console.error("Unable to connect", err));

exports.getAllFoods = async (_event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const foods = await Food.findAll({ attributes: ["id", "name", "notes"] });
    return createResponse(200, foods);
  } catch (err) {
    return createResponse(400, err);
  }
};

exports.getFoodById = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const foodId = event.pathParameters.id;
    if (foodId) {
      const food = await Food.findAll({
        attributes: ["id", "name", "notes"],
        where: {
          id: foodId,
        },
      });
      return createResponse(200, food);
    } else {
      return createResponse(400, "No id found in path");
    }
  } catch (err) {
    return createResponse(400, err);
  }
  
};

exports.addFood = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const eventBody = JSON.parse(event.body);
  try {
    const foodName: string = eventBody.name;
    const foodNotes: string = eventBody.notes || "";
    if (foodName) {
      const food = await Food.create({ name: foodName, notes: foodNotes });
      return createResponse(200, food);
    } else {
      return createResponse(400, { message: "No name found in body" });
    }
  } catch (err) {
    console.log(err);
    return createResponse(400, err);
  }
};
