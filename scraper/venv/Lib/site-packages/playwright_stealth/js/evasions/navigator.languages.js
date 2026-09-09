log("loading navigator.languages.js");
log(navigator.languages, opts.navigator_languages_override);
if (utils.arrayEqual(navigator.languages, opts.navigator_languages_override)) {
  log("not patching navigator.languages, assuming CLI args were used instead");
} else {
  utils.replaceProperty(Object.getPrototypeOf(navigator), "languages", {
    get: () => opts.navigator_languages_override
  });
}
