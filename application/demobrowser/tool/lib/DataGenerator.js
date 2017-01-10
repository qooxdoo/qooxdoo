/*global module*/
(function () {
  'use strict';

  // core libraries
  var fs = require('graceful-fs');
  var util = require('util');

  // 3rd party packages
  var path = require('path');
  var walker = require('walker');
  var mkdirp = require('mkdirp');

  // global vars
  var jobSectionTemplate = {
    "source-XXX": {
      "extend": ["default-demo"],
      "let": {
        "DPACKAGE": "ZZZ",
        "DSNAME": "YYY",
        "BUILDTYPE": "source",
        "EXCEPT": ["*"]
      }
    },
    "build-XXX": {
      "extend": ["default-demo"],
      "let": { "DPACKAGE": "ZZZ",
        "DSNAME": "YYY",
        "BUILDTYPE": "build",
        "EXCEPT": []
      },
      "compile-options": {
        "code": {
          "optimize": [
            "variables",
            "basecalls",
            "strings",
            "privates",
            "whitespace"
          ]
        }
      }
    }
  };

  var DataGenerator = function (config) {
    if (config.verbose) {
      console.log('Current config %s', JSON.stringify(config));
    }

    this.config = config;
    this.demos = [];
    this.entries = [];
  };
  DataGenerator.prototype = {
    /**
     * catches all the entries (demo) from config.demoPath
     *
     * @param done
     */
    catchEntries: function (done) {
      var dataGenerator = this;

      var demoPath = this.config.demoPath;
      if (demoPath.substr(-1) === path.sep) {
        demoPath = demoPath.substr(0, demoPath.length - 1);
      }
      demoPath += path.sep;

      console.log('Catch entries in %s', demoPath);

      walker(demoPath)
        .on('file', function (entry, stat) {
          if (dataGenerator.config.verbose) {
            console.log('read file %s (total amount (%s)', entry, dataGenerator.entries.length);
          }

          var filePath = entry.replace(demoPath, '');
          dataGenerator.entries.push({
            entry: entry,
            path: filePath,
            level: filePath.split(path.sep).length,
            type: 'file',
            stat: stat
          });
        })
        .on('dir', function (entry, stat) {
          if (dataGenerator.config.verbose) {
            console.log('read directory %s (total amount (%s)', entry, dataGenerator.entries.length);
          }

          var directoryPath = entry.replace(demoPath, '');
          // avoid empty entries
          if (directoryPath.length > 0) {
            dataGenerator.entries.push({
              entry: entry,
              path: directoryPath,
              level: directoryPath.split(path.sep).length,
              type: 'dir',
              stat: stat
            });
          }

        })
        .on('end', function () {
          console.log('%s entries (files and directories) catched', dataGenerator.entries.length);
          done(null, dataGenerator.entries);
        });
    },

    /**
     * Creates json file with all demos
     *
     * @param {function} done
     */
    createJsonDataFile: function (done) {
      var dataGenerator = this;
      var directories = this.getDirectories();

      /**
       * Get directories. The variable directory has the following structure:
       *
       * <pre>
       * {
       *    entry: 'source/demo/ui/json',
       *    path: 'ui/json',
       *    type: 'dir',
       *    stat: [Object object],
       *    level: 2
       * }
       * </pre>
       */
      directories.forEach(function (directory) {
        // add only directories at first level to ignore sub-folders at 2nd level like data
        if (directory.level === 1) {
          if (dataGenerator.config.verbose) {
            console.log('Demo "%s" added to data generator', directory.path);
          }
          dataGenerator.addDemo(directory.path);
        }
      });

      // get files
      var fileCounter = 0;
      var files = this.getFiles();

      /**
       * Get files. The variable file has the following structure:
       *
       * <pre>
       * {
       *    entry: 'source/demo/virtual/json/tree.json',
       *    path: 'virtual/json/tree.json',
       *    type: 'file',
       *    stat: [Object object],
       *    level: 2
       * }
       * </pre>
       */
      files.forEach(function (file) {
        // add only files at second level to ignore unneeded files
        if (file.level === 2) {

          var jsFilePath = dataGenerator.convertHtmlFilePathToJsFilePath(file.path);
          // check if javascript file exists
          if (fs.existsSync(jsFilePath)) {
            fileCounter++;

            // get the tags and class name from javascript file
            dataGenerator.getTagsFromJsFile(jsFilePath, function (err, tags) {
              var filePathParts = file.path.split('/');
              if (dataGenerator.config.verbose) {
                console.log('Demo test "%s" added to data generator', file.path);
              }
              dataGenerator.addDemoTest(
                filePathParts[0],
                filePathParts[1],
                tags
              );
              fileCounter--;

              // are all files processed
              if (fileCounter === 0) {
                // save json file with all demos
                var demoDataJsonFile = dataGenerator.config.demoDataJsonFile;
                var dirName = path.dirname(demoDataJsonFile);
                mkdirp(dirName, function () {
                  dataGenerator.saveAsJsonFile(demoDataJsonFile, dataGenerator.getDemos());
                  done(null);
                });
              }
            });
          }
        }
      });
    },

    /**
     * Convert a html file path to js file path
     *
     * @param {string} filePath
     * @returns {*}
     */
    convertHtmlFilePathToJsFilePath: function (filePath) {
      // get the equivalent js file
      return path.join(
        this.config.jsSourcePath,
        filePath.replace('.html', '.js')
      );
    },

    /**
     * Create config.demo.json file with all the jobs
     *
     * @param {function} done
     */
    createJsonConfigFile: function (done) {
      var dataGenerator = this;

      var source = [];
      var build = [];
      var shadowedJobs = [];

      var data = {};
      data['include'] = [
        {
          path: 'tool/default.json'
        }
      ];
      data['jobs'] = {};
      data['config-warnings'] = {
        'job-shadowing': shadowedJobs
      };

      var files = this.getFiles('.html');
      files.forEach(function (file) {
        var demoCategory = dataGenerator.getDemoCategoryFromFile(file.path);

        // check for demo-specific config file
        var configFile = file.entry.replace('.html', '.json');
        if (fs.existsSync(configFile)) {
          data['include'].push({
            path: configFile
          });
        }

        // build classname (category.name)
        var className = [demoCategory.category, demoCategory.name].join('.');

        if (dataGenerator.isValidDemoCategory(demoCategory)) {
          source.push('source-' + className);
          build.push('build-' + className);

          var jobSection = dataGenerator.createJobSection(demoCategory);
          data['jobs'] = dataGenerator.mergeJobs(data['jobs'], jobSection);
        }

      });

      data['jobs']['source'] = {
        run: source
      };
      data['jobs']['build'] = {
        run: build
      };

      var demoConfigJsonFile = dataGenerator.config.demoConfigJsonFile;
      dataGenerator.saveAsJsonFile(demoConfigJsonFile, data, done);
    },

    /**
     * Checks if the given demo category is valid regarding naming
     *
     * @param demoCategory
     * @returns {boolean}
     */
    isValidDemoCategory: function (demoCategory) {
      return ['data', 'blank', 'undefined'].indexOf(demoCategory.name) <= -1;
    },

    /**
     * Replace variables in jobSectionTemplate and return parsed string
     *
     * @param {object} demoCategory
     * @returns {string}
     */
    createJobSection: function (demoCategory) {
      var className = [demoCategory.category, demoCategory.name].join('.');
      var stringifiedJobSectionTemplate = JSON.stringify(jobSectionTemplate);

      return JSON.parse(stringifiedJobSectionTemplate
        .split('XXX').join(className)
        .split('YYY').join(demoCategory.name)
        .split('ZZZ').join(demoCategory.category)
      );
    },

    /**
     * copy all javascript files to config.scriptDestinationPath
     *
     * @param {function} done
     */
    copyJsFiles: function (done) {
      var dataGenerator = this;

      var files = this.getFiles('.html');
      var fileCounter = 0;
      files.forEach(function (file) {
        if (file.level === 2) {
          var demoDataJsonFilePath = path.dirname(dataGenerator.config.demoDataJsonFile);
          var demoCategory = dataGenerator.getDemoCategoryFromFile(file.path);
          var className = path.join(
            'demobrowser',
            'demo',
            demoCategory.category,
            demoCategory.name
          );

          if (!fs.existsSync(demoDataJsonFilePath)) {
            fs.mkdirSync(demoDataJsonFilePath);
          }

          var jsFilePath = path.join(dataGenerator.config.classPath, className + '.js');

          if (fs.existsSync(jsFilePath)) {
            fileCounter += 1;
            dataGenerator.copyJsFile(
              jsFilePath,
              path.join(
                demoDataJsonFilePath,
                util.format(
                  'demobrowser.demo.%s.%s.src.js',
                  demoCategory.category,
                  demoCategory.name
                )
              ),
              function (err) {
                if (err) {
                  console.error(err);
                }
                fileCounter -= 1;

                // Are all file are copied
                if (fileCounter === 0) {
                  done(null);
                }
              }
            );
          }

        }
      });
    },

    /**
     * copy single javascript file
     *
     * @param {string} sourcePath
     * @param {string} targetPath
     * @param {function} done
     */
    copyJsFile: function (sourcePath, targetPath, done) {
      var dataGenerator = this;

      var readStream = fs.createReadStream(sourcePath);
      readStream.on("error", function (err) {
        done(err);
      });
      var writeStream = fs.createWriteStream(targetPath);
      writeStream.on("error", function (err) {
        if (dataGenerator.config.verbose) {
          console.log('[ERR] %s doesn\'t copied to %s', sourcePath, targetPath);
        }
        done(err);
      });
      writeStream.on("close", function () {
        if (dataGenerator.config.verbose) {
          console.log('%s copied to %s', sourcePath, targetPath);
        }
        done();
      });
      readStream.pipe(writeStream);
    },

    /**
     * Adds a demo to internal data store
     *
     * @param {string} demoName
     */
    addDemo: function (demoName) {
      this.demos.push({
        classname: demoName,
        tests: []
      });
    },

    /**
     * Adds a test to a specific demo.
     *
     * @param {string} demoName
     * @param {string} testName
     * @param {object} tags
     */
    addDemoTest: function (demoName, testName, tags) {
      this.demos.forEach(function (item) {
        if (item.classname === demoName) {
          var title = path.basename(testName, '.html').replace('_', ' ');
          var testNameParts = testName.split('_');
          var nr = 0;
          if (testNameParts.length === 2) {
            nr = testNameParts[1].replace('.html', '');
          }
          item.tests.push({
            name: testName,
            tags: tags,
            title: title,
            nr: nr
          });
        }
      });
    },

    /**
     * Get @tag's and qx classes from a specific js file
     *
     * @param {string} jsFilePath
     * @param {function} done
     */
    getTagsFromJsFile: function (jsFilePath, done) {
      fs.readFile(jsFilePath, 'utf8', function (err, data) {
        if (err) {
          return done(err);
        }
        var content = data.split("\n");
        var tags = [];
        content.forEach(function (line) {
          var tagsRegex = /\@tag\s(.*)/;
          var qooxdooRegex = /(qx\.[^(;\s]*)\(/;
          var match;

          if (match = tagsRegex.exec(line)) {
            tags.push(match[1]);
          }
          if (match = qooxdooRegex.exec(line)) {
            tags.push(match[1]);
          }
        });

        return done(null, tags);
      });
    },

    /**
     * Returns the internal data
     *
     * @returns {Array}
     */
    getDemos: function () {
      return this.demos;
    },

    /**
     * Save the internal data to a json file
     *
     * @param fileName
     * @param content
     * @param done
     */
    saveAsJsonFile: function (fileName, content, done) {
      var data = JSON.stringify(content, null, 4);
      fs.writeFile(fileName, data, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log(fileName + ' created');
          if (done !== null && typeof done === 'function') {
            done(null);
          }
        }
      });
    },

    /**
     * Extract category name and file name for path
     *
     * @param {string} filePath
     * @returns {{name: string, category: string}}
     */
    getDemoCategoryFromFile: function (filePath) {
      var fileName = filePath.replace(this.config.demoPath, '');
      var fileNameParts = fileName.split('/');

      return {
        category: fileNameParts[0],
        name: fileNameParts[1] ? path.basename(fileNameParts[1], '.html') : 'undefined'
      };
    },

    /**
     * Get all files and directories
     *
     * @returns {Array}
     */
    getEntries: function () {
      return this.entries;
    },

    /**
     * Get all files from config.demoPath
     *
     * @returns {Array}
     */
    getFiles: function (nameFilter) {
      return this.entries.filter(function (file) {
        var include = file.type === 'file';
        if (include && nameFilter !== undefined) {
          include = file.entry.indexOf(nameFilter) > 0;
        }
        return include;
      });
    },

    /**
     * Get all directories from config.demoPath
     *
     * @returns {Array}
     */
    getDirectories: function (nameFilter) {
      return this.entries.filter(function (directory) {
        var include = directory.type === 'dir';
        if (include && nameFilter !== undefined) {
          include = directory.entry.indexOf(nameFilter) > 0;
        }
        return include;
      });
    },

    /**
     * Merge jobs. Using own method to give possibility to hook into the merging
     *
     * @param {object} existingJobs
     * @param {object} newJobs
     * @returns {object} merged jobs
     */
    mergeJobs: function (existingJobs, newJobs) {
      for (var key in newJobs) {
        if (newJobs.hasOwnProperty(key)) {
          existingJobs[key] = newJobs[key];
        }
      }
      return existingJobs;
    }
  };

  module.exports = DataGenerator;
}());
