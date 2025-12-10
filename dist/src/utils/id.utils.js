"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiKey = generateApiKey;
exports.generateReference = generateReference;
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
function generateApiKey() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
function generateReference() {
    return `ref_${(0, uuid_1.v4)()}`;
}
//# sourceMappingURL=id.utils.js.map