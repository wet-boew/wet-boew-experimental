/*----------------------------------------------------------------
 * Echo Grunt Task
 *----------------------------------------------------------------*/

module.exports = function(grunt) {
    grunt.registerTask('echo', function() {
        this.async();
		grunt.log.writeln('Ok Echo!!!');
    });
};