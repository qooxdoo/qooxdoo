// requires
var util = require('util');
var qx = require("${REL_QOOXDOO_PATH}/tool/grunt");

// grunt
module.exports = function(grunt) {
  var config = {

    generator_config: {
      let: {
      }
    },

    common: {
      "APPLICATION" : "${Namespace}",
      "QOOXDOO_PATH" : "${REL_QOOXDOO_PATH}",
      "LOCALES": ["en"],
      "QXTHEME": "${Namespace}.theme.Theme"
    },

    'http-server': {
 
        'dev': {
 
            // the server root directory 
            root: ".",
 
            // the server port 
            // can also be written as a function, e.g. 
            // port: function() { return 8282; } 
            port: 9999,
 
            // the host ip address 
            // If specified to, for example, "127.0.0.1" the server will 
            // only be available on that ip. 
            // Specify "0.0.0.0" to be available everywhere 
            host: "127.0.0.1",
 
            showDir : true,
            autoIndex: true,
 
            // server default file extension 
            ext: "html",
 
            // specify a logger function. By default the requests are 
            // sent to stdout. 
            // logFn: function(req, res, error) {},
 
            // Proxies all requests which can't be resolved locally to the given url 
            // Note this this will disable 'showDir' 
            // proxy: "http://mybackendserver.com",

            // Tell grunt task to open the browser 
            openBrowser : true
 
        }
 
    }

    /*
    myTask: {
      options: {},
      myTarget: {
        options: {}
      }
    }
    */
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  // // 3. Where we tell Grunt we plan to use this plug-in.
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-http-server');

  // // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
  // grunt.registerTask('default', ['concat']);
  grunt.registerTask('source-server-nodejs', ['http-server:dev']);

  // grunt.loadNpmTasks('grunt-my-plugin');
};
