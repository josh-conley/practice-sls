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

type FoodType = {
  id: number,
  name: string,
  notes: string
}

const Food = sequelize.define(
  "food",
  {
    id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
  .catch((err) => console.error("Unable to connect", err));

exports.getAllFoods = async (_event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const foods = await Food.findAll({ attributes: ["id", "name", "notes"] });
    return createResponse(200, { message: "Foods found", data: foods });
  } catch (err) {
    return createResponse(500, err);
  }
};

exports.getFoodById = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const foodId: string = event.pathParameters.id;
    if (foodId) {
      const food = await Food.findByPk(foodId);
      if (!food) {
        return createResponse(200, { message: "No food found", data: food });
      }
      return createResponse(200, { message: "Food found", data: food });
    } else {
      return createResponse(400, { message: "No id found in path", data: null });
    }
  } catch (err) {
    return createResponse(500, err);
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
      return createResponse(200, { message: "Food added", data: food });
    } else {
      return createResponse(400, { message: "No name found in body", data: null });
    }
  } catch (err) {
    console.log(err);
    return createResponse(500, err);
  }
};

exports.updateFood = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const eventBody = JSON.parse(event.body);
  try {
    const foodId: number = eventBody.id;
    const foodName: string = eventBody.name;
    const foodNotes: string = eventBody.notes || "";
    if (foodId) {
      const food = await Food.findByPk(foodId);
      const foodObj: FoodType = food.toJSON() as FoodType;
      food.set("name", foodName || foodObj.name);
      food.set("notes", foodNotes || foodObj.notes);
      const updateResult = await food.save();
      return createResponse(200, { message: "Food updated", data: updateResult });
    } else {
      return createResponse(400, { message: "No updated fields provided", data: null });
    }
  } catch (err) {
    console.log(err);
    return createResponse(500, err);
  }
};

exports.deleteFood = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const foodId: number = event.pathParameters.id;
    if (foodId) {
      const food = await Food.findByPk(foodId);

      if (!food) {
        return createResponse(200, { message: "ID not found", data: null });
      }

      await food.destroy();
      return createResponse(200, { message: "Food deleted", data: foodId });
    } else {
      return createResponse(400, { message: "No Food ID provided in path", data: null });
    }
  } catch (err) {
    console.log(err);
    return createResponse(500, err);
  }
};