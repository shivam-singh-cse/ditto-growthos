const crypto = require("crypto");

const getStableUuid = (str) => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

console.log(getStableUuid("hello"));
console.log(getStableUuid("hello"));
console.log(getStableUuid("world"));
