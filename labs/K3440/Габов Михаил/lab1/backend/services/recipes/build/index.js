"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const data_source_1 = require("./data-source");
const rabbitmq_config_1 = require("./rabbitmq-config");
const app_1 = require("./app");
const PORT = process.env.PORT || 3002;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!RABBITMQ_URL) {
                throw new Error('RABBITMQ_URL not defined');
            }
            console.log("Connecting to database...");
            const dbPromise = data_source_1.AppDataSource.initialize();
            console.log("Connecting to RabbitMQ...");
            const rabbitPromise = (0, rabbitmq_config_1.initRabbitMQ)(RABBITMQ_URL);
            yield Promise.all([dbPromise, rabbitPromise]);
            console.log("All connections established successfully.");
            app_1.app.listen(PORT, () => {
                console.log(`Recipes service running on http://localhost:${PORT}`);
            });
        }
        catch (error) {
            console.error("Failed to start the server due to connection errors:", error);
            process.exit(1);
        }
    });
}
startServer();
