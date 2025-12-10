"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = void 0;
const common_1 = require("@nestjs/common");
const Permissions = (...p) => (0, common_1.SetMetadata)('permissions', p);
exports.Permissions = Permissions;
//# sourceMappingURL=permissions.decorator.js.map