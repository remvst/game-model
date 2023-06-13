export interface Encoder {
    reset(): this;
    appendString(str: string): this;
    appendNumber(num: number): this;
    appendBool(bool: boolean): this;
    getResult(): string;
}

export interface Decoder {
    setEncoded(encoded: string): void;
    nextString(): string;
    nextNumber(): number;
    nextBool(): boolean;
}

export class ArrayEncoder implements Encoder {

    private items: any[];

    reset(): this {
        this.items = [];
        return this;
    }

    getResult(): string {
        return JSON.stringify(this.items);
    }

    appendString(str: string): this {
        this.items.push(str);
        return this;
    }

    appendNumber(num: number): this {
        this.items.push(num);
        return this;
    }

    appendBool(bool: boolean): this {
        this.items.push(bool);
        return this;
    }
}

export class ArrayDecoder implements Decoder {

    private items = [];
    private currentIndex = 0;

    setEncoded(encoded: string): void {
        this.items = JSON.parse(encoded);
        this.currentIndex = 0;
    }

    nextString(): string {
        return this.items[this.currentIndex++];
    }

    nextNumber(): number {
        return this.items[this.currentIndex++];
    }

    nextBool(): boolean {
        return this.items[this.currentIndex++];
    }
}
