const s = require("fs").readFileSync("js/main.js", "utf8");
const lines = s.split("\n");
console.log("lines:", lines.length);
// structural sanity: braces/parens balance
let b = 0, p = 0, k = 0;
for (const c of s) { if (c === "{") b++; if (c === "}") b--; if (c === "(") p++; if (c === ")") p--; if (c === "[") k++; if (c === "]") k--; }
console.log("balance { }:", b, "( ):", p, "[ ]:", k);
// boot intact?
console.log("boot:", (s.match(/DOMContentLoaded/g) || []).length);
console.log("bindStaticEvents:", (s.match(/function bindStaticEvents/) || []).length);
console.log("initCheckout:", (s.match(/function initCheckout/) || []).length);
console.log("renderProducts:", (s.match(/function renderProducts/) || []).length);
// find suspicious leftovers
const badLines = [];
lines.forEach((l, i) => { if (l.trim() === '"eft-lifetime": { tabs: [' || l.trim() === '}' + '"') badLines.push(i + 1); });
console.log("suspicious:", badLines);
// last 5 lines
console.log(lines.slice(-5).join("\n"));
