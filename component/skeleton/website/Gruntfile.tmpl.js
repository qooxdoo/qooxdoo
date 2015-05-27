// requires
var util = require('util');
var qx = require("${REL_QOOXDOO_PATH}/tool/grunt");

var path = require('path');
var fs = require('fs');

// grunt
module.exports = function(grunt) {

  var config = {
    generator_config: {
      let : {
      }
    },

    common: {
      "APPLICATION" : "${Namespace}",
      "QOOXDOO_PATH" : "${REL_QOOXDOO_PATH}",
      "TESTRUNNER_ROOT" : "<%= common.QOOXDOO_PATH %>/component/testrunner",
      "LOCALES": ["en"],
      "QXTHEME": "<%= common.APPLICATION %>.theme.Theme"
    },

    concat: {
      options: {
        separator: ';'
      },
      samples : {
        src: ['api/samples/*.js'],
        dest: 'api/script/samples.js'
      }
    },

    sass: {
      indigo: {
        options: {
          style: 'compressed'
        },
        files: {
          'script/indigo.css': '<%= common.QOOXDOO_PATH %>/framework/source/resource/qx/website/scss/indigo.scss'
        }
      }
    },

    replace: {
      templVarWithMinifiedCss: {
        src: 'test/script/testrunner-portable.js',
        overwrite: true,
        replacements: [{
          from: /%\{Styles\}/g,
          to: function (matchedWord) {
            var qxPath = grunt.template.process('<%= common.QOOXDOO_PATH %>', {data:this.common});
            var testrunnerRoot = grunt.template.process('<%= common.TESTRUNNER_ROOT %>', {data:this.common});

            var resetCss = path.join(qxPath, '/component/library/indigo/source/resource/indigo/css/reset.css');
            var baseCss = path.join(qxPath, '/component/library/indigo/source/resource/indigo/css/base.css');
            var indigoCss = 'script/indigo.css';
            var testrunnerCss = path.join(testrunnerRoot, '/source/resource/testrunner/view/html/css/testrunner.css');

            var contentResetCss = fs.readFileSync(resetCss, {encoding: 'utf8'});
            var contentBaseCss = fs.readFileSync(baseCss, {encoding: 'utf8'});
            var contentIndigoCss = fs.readFileSync(indigoCss, {encoding: 'utf8'});
            var contentTestrunnerCss = fs.readFileSync(testrunnerCss, {encoding: 'utf8'});

            var CleanCSS = require('clean-css');
            var concatOfFiles = contentResetCss + contentBaseCss + contentIndigoCss + contentTestrunnerCss;
            var minifiedCss = new CleanCSS().minify(concatOfFiles);

            return minifiedCss.replace(/'/g, '"');
          }
        }]
      }
    },

    babel: {
      options: { sourceMap: false },
      dist: {
        files: {
          'api/ViewerDataUtil.es5': '<%= common.QOOXDOO_PATH %>/component/standalone/website/api/ViewerDataUtil.es6',
          'api/ViewerData.es5': '<%= common.QOOXDOO_PATH %>/component/standalone/website/api/ViewerData.es6'
        }
      }
    },

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
  //console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-text-replace');

  // grunt.loadNpmTasks('grunt-my-plugin');

  // 'extend' API job
  grunt.task.renameTask('api', 'generate-api');
  grunt.task.registerTask(
    'api',
    'Concat the samples and generate the API.',
    ["concat:samples", "generate-api", "babel", "write-viewer-data", "sass:indigo"]
  );

  // 'extend' test job
  grunt.task.renameTask('test', 'generate-test');
  grunt.task.registerTask(
    'test',
    'Generate the Indigo CSS and the Test Runner (using a minified version of qx.Website).',
    ["generate-test", "sass:indigo", "replace:templVarWithMinifiedCss"]
  );

  // 'extend' test-source job
  grunt.task.renameTask('test-source', 'generate-test-source');
  grunt.task.registerTask(
    'test-source',
    'Generate the Indigo CSS and the Test Runner (using a source version of qx.Website).',
    ["generate-test-source", "sass:indigo"]
  );

  // 'extend' build job
  grunt.task.renameTask('build', 'temp');
  grunt.task.registerTask(
    'build',
    'Generate the build version of qx.Website and the widget CSS',
    ["generate:build", "sass:indigo"]
  );

  // 'extend' build-min job
  grunt.task.renameTask('build-min', 'temp');
  grunt.task.registerTask(
    'build-min',
    'Generate the build version of qx.Website and the widget CSS',
    ["generate:build-min", "sass:indigo"]
  );

  grunt.registerTask('write-viewer-data', 'Writes viewer data file.', function() {
    var ViewerData = require('./api/ViewerData.es5');
    var ast = JSON.parse(fs.readFileSync('api/script/qxWeb.json', {encoding: 'utf8'}));
    var viewerData = new ViewerData();
    viewerData.processAst(ast);
    var rawData = viewerData.getRawData();
    grunt.log.writeln("Produced JSON for the following modules:");
    grunt.log.oklns(JSON.stringify(Object.keys(rawData)));
    fs.writeFileSync('api/script/viewer-data.json', JSON.stringify(rawData), {encoding: 'utf8'});
  });
};
