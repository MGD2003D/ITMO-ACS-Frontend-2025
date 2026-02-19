"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
require("dotenv/config");
const typeorm_1 = require("typeorm");
const models_1 = require("./models");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: +(process.env.DB_PORT || 5433),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "recipes_db",
    synchronize: true,
    logging: true,
    entities: [
        models_1.Recipe,
        models_1.Ingredient,
        models_1.RecipeIngredient,
        models_1.RecipeStep,
    ],
});
