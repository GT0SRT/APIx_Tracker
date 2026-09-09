log("loading navigator.hardwareConcurrency");

utils.replaceProperty(Object.getPrototypeOf(navigator), "hardwareConcurrency", {
  get() {
    return 4;
  }
});
