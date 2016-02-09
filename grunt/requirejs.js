/*----------------------------------------------------------------
 * RequireJS Task
 *----------------------------------------------------------------*/

module.exports = {
    compile: {
       options: {
		  appDir: "src/",
          baseUrl: ".",
          mainConfigFile: "require.build.js",
          name: "libs/almond/almond.js",
		   out: "build/js/wet-boew.js"
       }
     }
};