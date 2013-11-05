module.exports = function(grunt) {
  grunt.loadNpmTasks('qooxdoo-generator');

  grunt.registerTask('api', 'Build the API viewer.', function(job) {
    grunt.task.run(["generate:api"]);
  });

  grunt.registerTask('lint', 'Build the API viewer.', function(job) {
    grunt.task.run(["generate:lint"]);
  });
};