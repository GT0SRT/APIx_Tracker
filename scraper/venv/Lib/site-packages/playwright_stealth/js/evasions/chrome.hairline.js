log("loading chrome.hairline.js");
// inspired by: https://intoli.com/blog/making-chrome-headless-undetectable/
const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype,
  "offsetHeight");

utils.replaceProperty(HTMLDivElement.prototype, "offsetHeight", {
  get: function() {
    // hmmm not sure about this
    if (this.id === "modernizr") {
      return 1;
    }
    return elementDescriptor.get.apply(this);
  }
});
