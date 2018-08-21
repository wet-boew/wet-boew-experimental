({
   baseUrl: ".",
   include: [ "wb5", 'module/aria', 'module/broadcast', "module/core/date", "module/core/pad", "module/core/number"],
   name: "almond",
   wrap: true,
   findNestedDependencies: true,
   optimize: "uglify2",
   out: "../build/js/wb5.js"
})
