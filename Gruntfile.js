module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    
    less: {
      dev: {
        files: {
          "styles/site.css": "styles/site.less"
        }
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task(s).
  grunt.registerTask('default', ['less']);

};