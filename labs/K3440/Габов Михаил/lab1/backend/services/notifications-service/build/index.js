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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const amqplib_1 = __importDefault(require("amqplib"));
const axios_1 = __importDefault(require("axios"));
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const RECIPES_SERVICE_URL = process.env.RECIPES_SERVICE_URL;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[Notifications Service] Connecting to RabbitMQ...');
        try {
            if (!RABBITMQ_URL) {
                throw new Error('RABBITMQ_URL not defifned');
            }
            const connection = yield amqplib_1.default.connect(RABBITMQ_URL);
            const channel = yield connection.createChannel();
            console.log('[Notifications Service] RabbitMQ connection successful!');
            const newRecipesQueue = 'new_recipe_events';
            const interactionsQueue = 'interactions_events';
            yield channel.assertQueue(newRecipesQueue, { durable: true });
            yield channel.assertQueue(interactionsQueue, { durable: true });
            channel.consume(newRecipesQueue, (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg) {
                    const event = JSON.parse(msg.content.toString());
                    try {
                        const userResponse = yield axios_1.default.get(`${AUTH_SERVICE_URL}/users/${event.userId}`);
                        const username = userResponse.data.username;
                        console.log(`\nНОВЫЙ РЕЦЕПТ: Пользователь '${username}' выпустил новый рецепт: "${event.title}"!`);
                    }
                    catch (error) {
                        console.error("Failed to process new recipe event:", error);
                    }
                    channel.ack(msg);
                }
            }));
            channel.consume(interactionsQueue, (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg) {
                    const event = JSON.parse(msg.content.toString());
                    if (event.type === 'LikeCreated') {
                        const { userId, recipeId } = event.data;
                        try {
                            const recipeResponse = yield axios_1.default.get(`${RECIPES_SERVICE_URL}/recipes/${recipeId}`);
                            const recipeTitle = recipeResponse.data.title;
                            const authorId = recipeResponse.data.user.id;
                            const authorResponse = yield axios_1.default.get(`${AUTH_SERVICE_URL}/users/${authorId}`);
                            const authorUsername = authorResponse.data.username;
                            console.log(`\nНОВЫЙ ЛАЙК: Пользователь (ID: ${userId}) поставил лайк на рецепт "${recipeTitle}" от автора '${authorUsername}'!`);
                        }
                        catch (error) {
                            console.error("Failed to process like event:", error);
                        }
                    }
                    channel.ack(msg);
                }
            }));
            console.log('[Notifications Service] Waiting for messages...');
        }
        catch (error) {
            console.error('[Notifications Service] Failed to connect to RabbitMQ:', error);
            process.exit(1);
        }
    });
}
main();
