"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGuard = UserGuard;
exports.ServiceGuard = ServiceGuard;
exports.AnyAuthGuard = AnyAuthGuard;
const auth_guard_1 = require("./auth.guard");
__exportStar(require("./auth.guard"), exports);
function UserGuard() {
    return new auth_guard_1.AuthGuard(['user']);
}
function ServiceGuard() {
    return new auth_guard_1.AuthGuard(['service']);
}
function AnyAuthGuard() {
    return new auth_guard_1.AuthGuard(['user', 'service']);
}
//# sourceMappingURL=guards.js.map