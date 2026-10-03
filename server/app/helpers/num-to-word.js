export function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const scales = ["", "Thousand", "Lakh", "Crore"];

  // Split into rupees and paise
  const [rupeesPart, paisePart] = num.toFixed(2).split(".");
  const rupees = parseInt(rupeesPart, 10);
  const paise = parseInt(paisePart, 10);

  // Helper to convert up to 3 digits
  function convertToWords(n) {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    } else if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  // Break number into groups (e.g. crore, lakh, thousand, hundred)
  let remainder = rupees;
  let words = "";
  let i = 0;

  while (remainder > 0 && i < scales.length) {
    let chunk;
    if (i === 0) {
      chunk = remainder % 1000;
      remainder = Math.floor(remainder / 1000);
    } else {
      chunk = remainder % 100;
      remainder = Math.floor(remainder / 100);
    }

    if (chunk > 0) {
      words = convertToWords(chunk) + " " + scales[i] + " " + words;
    }
    i++;
  }

  words = words.trim();

  let finalWords = words ? `${words} Rupees` : "";

  if (paise > 0) {
    finalWords += ` and ${convertToWords(paise)} Paise`;
  }

  return finalWords + " Only";
}
