log("loading navigator.vendor.js");

utils.replaceProperty(Object.getPrototypeOf(navigator), "vendor", {
  get: () => opts.navigator_vendor || "Google Inc."
});
