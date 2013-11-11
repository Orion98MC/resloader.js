module.exports = function (grunt) {

  // Configure grunt
  grunt.initConfig({
    
    uglify: {
      dist: {
        files: {
          'dist/resloader.min.js': ['resloader.js']
        },
        options: {
          report: 'gzip'
        }
      }
    },
        
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');  
  grunt.registerTask('default', [ 'uglify']);
};
