"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./models/db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
db_1.default.sync({ force: true }).then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.error('Unable to connect to database: ', err);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map