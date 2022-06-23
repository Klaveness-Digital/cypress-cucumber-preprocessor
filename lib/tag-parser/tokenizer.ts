import { TagTokenizerError } from "./errors";

export const isAt = (char: string): boolean => char === "@";
export const isOpeningParanthesis = (char: string): boolean => char === "(";
export const isClosingParanthesis = (char: string): boolean => char === ")";
export const isWordChar = (char: string): boolean => /[a-zA-Z]/.test(char);
export const isQuote = (char: string): boolean => char === '"' || char === "'";
export const isDigit = (char: string): boolean => /[0-9]/.test(char);
export const isComma = (char: string): boolean => char === ",";
export const isEqual = (char: string): boolean => char === "=";

export class Tokenizer {
  public constructor(private content: string) {}

  public *tokens(): Generator<
    {
      value: string;
      position: number;
    },
    void,
    unknown
  > {
    let position = 0;

    while (position < this.content.length) {
      const curchar = this.content[position];

      if (
        isAt(curchar) ||
        isOpeningParanthesis(curchar) ||
        isClosingParanthesis(curchar) ||
        isComma(curchar) ||
        isEqual(curchar)
      ) {
        yield {
          value: curchar,
          position,
        };

        position++;
      } else if (isDigit(curchar)) {
        const start = position;

        while (
          isDigit(this.content[position]) &&
          position < this.content.length
        ) {
          position++;
        }

        yield {
          value: this.content.slice(start, position),
          position: start,
        };
      } else if (isWordChar(curchar)) {
        const start = position;

        while (
          isWordChar(this.content[position]) &&
          position < this.content.length
        ) {
          position++;
        }

        yield {
          value: this.content.slice(start, position),
          position: start,
        };
      } else if (isQuote(curchar)) {
        const start = position++;

        while (
          !isQuote(this.content[position]) &&
          position < this.content.length
        ) {
          position++;
        }

        if (position === this.content.length) {
          throw new TagTokenizerError("Unexpected end-of-string");
        } else {
          position++;
        }

        yield {
          value: this.content.slice(start, position),
          position: start,
        };
      } else {
        throw new TagTokenizerError(`Unknown token at ${position}: ${curchar}`);
      }
    }
  }
}
