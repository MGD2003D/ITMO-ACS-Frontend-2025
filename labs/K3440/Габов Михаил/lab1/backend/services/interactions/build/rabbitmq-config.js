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
exports.initRabbitMQ = initRabbitMQ;
exports.getRabbitMQChannel = getRabbitMQChannel;
const amqplib_1 = __importDefault(require("amqplib"));
let connection = null;
let channel = null;
function initRabbitMQ(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Connecting to RabbitMQ...');
        try {
            connection = yield amqplib_1.default.connect(url);
            console.log('RabbitMQ connection successful!');
            channel = yield connection.createChannel();
            console.log('RabbitMQ channel created!');
            yield channel.assertQueue('interactions_events', { durable: true });
        }
        catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            process.exit(1);
        }
    });
}
function getRabbitMQChannel() {
    if (!channel) {
        throw new Error('RabbitMQ channel has not been initialized. Call initRabbitMQ first.');
    }
    return channel;
}
