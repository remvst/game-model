export type EncoderSequence = any[];

export interface Encoder {
    reset(): this;
    appendString(str: string): this;
    appendNumber(num: number): this;
    appendBool(bool: boolean): this;
    appendSequence(sequence: EncoderSequence): this;
    getResult(): any[];
}

export interface Decoder {
    setEncoded(encoded: EncoderSequence): void;
    nextString(): string;
    nextNumber(): number;
    nextBool(): boolean;
    nextSequence(): EncoderSequence;
}

export class ArrayEncoder implements Encoder {

    private items: any[];

    reset(): this {
        this.items = [];
        return this;
    }

    getResult(): EncoderSequence {
        return this.items;

        // const fullJson = JSON.stringify(this.items);
        // return fullJson.slice(1, fullJson.length - 1);
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

    appendSequence(sequence: any[]): this {
        this.items.push(sequence);
        return this;
    }
}

export class ArrayDecoder implements Decoder {

    private items: EncoderSequence = [];
    private currentIndex = 0;

    setEncoded(encoded: EncoderSequence): void {
        this.items = encoded;
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

    nextSequence(): EncoderSequence[] {
        return this.items[this.currentIndex++];
    }
}
