"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeExpiry = computeExpiry;
function computeExpiry(expiry) {
    const now = new Date();
    switch (expiry) {
        case '1H':
            now.setHours(now.getHours() + 1);
            break;
        case '1D':
            now.setDate(now.getDate() + 1);
            break;
        case '1M':
            now.setMonth(now.getMonth() + 1);
            break;
        case '1Y':
            now.setFullYear(now.getFullYear() + 1);
            break;
        default: throw new Error('Invalid expiry token');
    }
    return now;
}
//# sourceMappingURL=expiry.util.js.map