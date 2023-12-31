import { ArrayDecoder, ArrayEncoder, Decoder, Encoder } from "../../src";

describe("a string encoder/decoder", () => {
    let encoder: Encoder;
    let decoder: Decoder;

    beforeEach(() => {
        encoder = new ArrayEncoder();
        decoder = new ArrayDecoder();
    });

    it("can encode and decode a string", () => {
        encoder.reset();
        encoder.appendString("mystring");

        const encoded = encoder.getResult();
        decoder.setEncoded(encoded);

        expect(decoder.nextString()).toBe("mystring");
    });

    it("can encode and decode a number", () => {
        encoder.reset();
        encoder.appendNumber(123);

        const encoded = encoder.getResult();
        decoder.setEncoded(encoded);

        expect(decoder.nextNumber()).toBe(123);
    });

    it("can encode and decode a number with a precision", () => {
        encoder.reset();
        encoder.appendNumber(0.3333333, 3);

        const encoded = encoder.getResult();
        decoder.setEncoded(encoded);

        expect(decoder.nextNumber()).toBe(0.333);
    });

    it("can encode and decode a boolean", () => {
        encoder.reset();
        encoder.appendBool(true);

        const encoded = encoder.getResult();
        decoder.setEncoded(encoded);

        expect(decoder.nextBool()).toBe(true);
    });

    it("can encode/decode everything", () => {
        encoder.reset();
        encoder.appendString("mystring");
        encoder.appendNumber(123);
        encoder.appendBool(true);

        const encoded = encoder.getResult();
        decoder.setEncoded(encoded);

        expect(decoder.nextString()).toBe("mystring");
        expect(decoder.nextNumber()).toBe(123);
        expect(decoder.nextBool()).toBe(true);
    });
});
