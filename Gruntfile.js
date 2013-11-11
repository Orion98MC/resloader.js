module.exports = function (grunt) {

  // Configure grunt
  grunt.initConfig({
    
    uglify: {
      dev: {
        files: {
          'dist/resloader.min.js': ['resloader.js']
        }
      }
    },
        
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');  
  grunt.registerTask('default', [ 'uglify']);
};
