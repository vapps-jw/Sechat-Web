const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join("home", "jwtk", ".cache", "puppeteer"),
};
