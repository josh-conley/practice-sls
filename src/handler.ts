"use strict";
import { Sequelize, QueryTypes, DataTypes } from "sequelize";
import { createResponse } from "./util/response-handler";
require("pg");

const sequelize = new Sequelize(
  "postgres://josh:josh@jconley.coamwry8rhzq.us-east-1.rds.amazonaws.com:5432/postgres"
);

const Food = sequelize.define(
  "food",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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

sequelize
  .authenticate()
  .then(() => console.log("Connection made"))
  .catch(() => console.error("Unable to connect"));

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
    const foodName = eventBody.name;
    const foodNotes = eventBody.notes || "";
    if (foodName) {
      const food = await Food.create({ name: foodName, notes: foodNotes });
      return createResponse(200, food);
    } else {
      return createResponse(400, { message: "No name found in body" });
    }
  } catch (err) {
    return createResponse(400, err);
  }
};
