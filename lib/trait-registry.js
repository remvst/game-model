"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TraitRegistry {
    constructor() {
        this.entries = new Map();
    }
    add(entry) {
        if (this.entries.has(entry.key)) {
            throw new Error(`Entry conflict for key ${entry.key}`);
        }
        this.entries.set(entry.key, entry);
        return this;
    }
    entry(key) {
        return this.entries.get(key) || null;
    }
    keys() {
        return this.entries.keys();
    }
}
exports.default = TraitRegistry;
