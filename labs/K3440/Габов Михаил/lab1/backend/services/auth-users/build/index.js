"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const data_source_1 = require("./data-source");
const routes_1 = require("./generated/routes");
const swagger_json_1 = __importDefault(require("../build/swagger.json"));
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
(0, routes_1.RegisterRoutes)(app);
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Auth & Users DB Connected");
    app.listen(PORT, () => console.log(`Auth & Users service running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error("DB connection error", err);
});
