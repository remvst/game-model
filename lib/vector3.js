"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vector3 = void 0;
class SimpleVector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
function vector3(x = 0, y = 0, z = 0) {
    return new SimpleVector3(x, y, z);
}
exports.vector3 = vector3;
