import Big from "big.js";

const multiples = [
  "",
  "thousand",
  "million",
  "billion",
  "trillion",
  "quadrillion",
  "quintillion",
  "sextillion",
  "septillion",
  "octillion",
  "nonillion",
  "decillion",
  "undecillion",
  "duodecillion",
  "tredecillion"
];
const tens = ["", "ten", "twenty", "thirty", "forty", "fifty"];
const units = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen"
];

// helper functions

const reverseString = (x: string) => x.split("").reverse().join("");

const toDigits = (n: string | number) => String(n).split("").map(Number);

const naivePlural = (word: string, count: number) =>
  `${word}${count > 1 ? "s" : ""}`;

const toChunks = (x: string) =>
  reverseString(x)
    .match(/.{1,3}/g)
    .reverse()
    .map(reverseString)
    .map((x) => new Big(x));

const toBig = (x: string | number) => new Big(x);
// parser

function parse(a: number, b: number, c: number) {
  const process = (): string => {
    if (!a && !b) {
      return c ? units[Number(c)] : "";
    } else if (!a && b === 1) {
      return `${b}${c}` in units
        ? units[Number(`${b}${c}`)]
        : units[Number(c)] + "teen";
    } else if (!a && b !== 1) {
      return (
        (b in tens ? tens[Number(b)] + "" : units[Number(b)] + "ty") +
        " " +
        parse(0, 0, c)
      );
    } else {
      return [units[Number(a)], "hundred", parse(0, b, c)].join(" ");
    }
  };

  return process().replace(/tt/g, "t");
}

export function intToEnglish(n: Big): string {
  if (!n) return "";

  const ns = toDigits(String(n));

  switch (ns.length) {
    case 1:
      return parse(0, 0, n.toNumber()).trim();
    case 2:
      return parse(0, ns[0], ns[1]).trim();
    case 3:
      return parse(ns[0], ns[1], ns[2]).trim();
    default:
      return toChunks(String(n))
        .map(intToEnglish)
        .reverse()
        .reduce(
          (acc, x, i) => (!x ? `${acc}` : `${x} ${multiples[i]} ${acc}`),
          ""
        )
        .trim();
  }
}

export interface FloatQualifiers {
  left: string;
  right: string;
}

const CURRENCY_QUALIFIERS: FloatQualifiers = {
  left: "dollar",
  right: "cent"
};

export function floatToEnglish(
  n: Big,
  qualifiers: FloatQualifiers = CURRENCY_QUALIFIERS
) {
  const [leftPart, rightPart] = String(n).split(".");
  const [left, right] = [leftPart, rightPart].map(toBig);

  const hasSingleDecimal = String(rightPart).length === 1 && rightPart !== "0";

  const sanitizedRight = hasSingleDecimal ? right.times(10) : right;

  return [left, sanitizedRight]
    .map(intToEnglish)
    .filter(Boolean) // excluedes falsy entries
    .join(` ${naivePlural(qualifiers.left, left.gt(2) ? 2 : 1)} and `)
    .concat(` ${naivePlural(qualifiers.right, sanitizedRight.gt(2) ? 2 : 1)}`);
}

export function numberToEnglish(n: string): string {
  if (!n.length) {
    return "";
  }
  if (n === "0") {
    return "zero";
  }

  const sanitized = n.replace(/\.0+$/, "");

  const bigN = toBig(sanitized);

  if (!bigN) {
    throw new Error("Input is not a valid number");
  }

  const isInteger = !sanitized.includes(".");

  const process = isInteger ? intToEnglish : floatToEnglish;

  return process(bigN);
}
