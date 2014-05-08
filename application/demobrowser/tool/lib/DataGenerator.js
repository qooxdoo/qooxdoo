/*global module*/
(function () {
  'use strict';

  // core libraries
  var fs = require('fs');
  var util = require('util');
  var walker = require('walker');

  // 3rd party packages
  var path = require('path');

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

  // main implementation
  var DataGenerator = function (config) {
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

      walker(this.config.demoPath)
        .on('file', function (entry, stat) {
          dataGenerator.entries.push({
            entry: entry,
            type: 'file',
            stat: stat
          });
        })
        .on('dir', function (entry, stat) {
          dataGenerator.entries.push({
            entry: entry,
            type: 'dir',
            stat: stat
          });
        })
        .on('end', function () {
          done(null, dataGenerator.entries);
        });
    },

    /**
     * Creates json file with all demos
     *
     * @param done
     */
    createJsonDataFile: function (done) {
      var dataGenerator = this;
      var directories = this.getDirectories();

      // get directories
      directories.forEach(function (directory) {
        var entry = directory.entry;
        var directoryPath = entry.replace(dataGenerator.config.demoPath, '');
        var directoryPathParts = directoryPath.split('/');

        // add only directories at first level
        if (directoryPathParts.length === 1) {
          dataGenerator.addDemo(directoryPath);
        }
      });

      // get files
      var fileCounter = 0;
      var files = this.getFiles();
      files.forEach(function (file) {
        var entry = file.entry;
        var filePath = entry.replace(dataGenerator.config.demoPath, '');
        var filePathParts = filePath.split('/');

        // add only files at second level
        if (filePathParts.length === 2) {
          // get the equivalent js file
          var categoryName = path.dirname(filePath);
          var jsFile = path.basename(entry, '.html') + '.js';
          var jsFilePath = path.join(dataGenerator.config.jsSourcePath, categoryName, jsFile);

          // check if javascript file exists
          if (fs.existsSync(jsFilePath)) {
            fileCounter++;

            // get the tags and class name from javascript file
            dataGenerator.getTagsFromJsFile(jsFilePath, function (err, tags) {
              dataGenerator.addDemoTest(
                filePathParts[0],
                filePathParts[1],
                tags
              );
              fileCounter--;

              // are all files processed?
              if (fileCounter === 0) {
                // save json file with all demos
                var outputFile = dataGenerator.config.outputFile;
                var dirName = path.dirname(outputFile);
                if (!fs.existsSync(dirName)) {
                  fs.mkdirSync(dirName);
                }

                dataGenerator.saveAsJsonFile(outputFile, dataGenerator.getDemos());
                done(null);
              }
            });
          }
        }
      });
    },

    /**
     * Create config.demo.json file with all the jobs
     *
     * @param done
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
      ]
      data['jobs'] = {};
      data['config-warnings'] = {
        'job-shadowing': shadowedJobs
      }

      var files = this.getFiles('.html');
      files.forEach(function (file) {
        var demoCategory = dataGenerator.getDemoCategoryFromFile(file.entry);

        // check for demo-specific config file
        var configFile = file.entry.replace('.html', '.json');
        if (fs.existsSync(configFile)) {
          data['include'].push({
            path: configFile
          });
        }

        // build classname (category.name)
        var className = [demoCategory.category, demoCategory.name].join('.');
        source.push('source-' + className);
        build.push('build-' + className);

        var jobSection = dataGenerator.createJobSection(demoCategory);
        data['jobs'] = dataGenerator.mergeJobs(data['jobs'], jobSection);
      });

      data['jobs']['source'] = {
        run: source
      };
      data['jobs']['build'] = {
        run: build
      };

      var demoConfigJsonFile = dataGenerator.config.demoConfigJsonFile;
      dataGenerator.saveAsJsonFile(demoConfigJsonFile, data, function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
    },

    /**
     * Replace variables in jobSectionTemplate and return parsed string
     *
     * @param demoCategory
     * @returns {*}
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
     */
    copyJsFiles: function () {
      var dataGenerator = this;
      var className = util.format('demobrowser.demo.%s.%s')
      dataGenerator.copyJsFile(
        util.format('%s/%s.js', dataGenerator.config.classPath, className),
        util.format('source/script/%s'),
        function (err, done) {
          if (err) {
            console.error(err);
          }
        }
      );
    },

    /**
     * copy single javascript file
     *
     * @param sourcePath
     * @param targetPath
     * @param done
     */
    copyJsFile: function (sourcePath, targetPath, done) {
      var readStream = fs.createReadStream(sourcePath);
      readStream.on("error", function (err) {
        done(err);
      });
      var writeStream = fs.createWriteStream(targetPath);
      writeStream.on("error", function (err) {
        done(err);
      });
      writeStream.on("close", function (ex) {
        done();
      });
      readStream.pipe(writeStream);
    },

    /**
     * Adds a demo to internal data store
     *
     * @param demoName
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
     * @param demoName
     * @param testName
     * @param tags
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
     * @param jsFilePath
     * @param done
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

        done(null, tags);
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
     */
    saveAsJsonFile: function (fileName, content, done) {
      var data = JSON.stringify(content, null, 4);
      fs.writeFile(fileName, data, function (err) {
        if (err) {
          console.error(err);
        } else {
          if (done !== null && typeof done === 'function') {
            done(err);
          }

        }
      });
    },

    /**
     *
     *
     * @param filePath
     * @returns {{name: string, category: string}}
     */
    getDemoCategoryFromFile: function (filePath) {
      var fileName = filePath.replace(this.config.demoPath, '');
      var fileNameParts = fileName.split('/');

      var demoCategory = {
        category: fileNameParts[0],
        name: path.basename(fileNameParts[1], '.html')
      };
      return demoCategory;
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
      var files = this.entries.filter(function (file) {
        var include = file.type === 'file';
        if (include && nameFilter !== undefined) {
          include = file.entry.indexOf(nameFilter) > 0;
        }
        return include;
      });
      return files;
    },

    /**
     * Get all directories from config.demoPath
     *
     * @returns {Array}
     */
    getDirectories: function (nameFilter) {
      var directories = this.entries.filter(function (directory) {
        var include = directory.type === 'dir';
        if (include && nameFilter !== undefined) {
          include = directory.entry.indexOf(nameFilter) > 0;
        }
        return include;
      });
      return directories;
    },

    /**
     * Merge jobs. Using own method to give possibility to hook into the merging
     *
     * @param existingJobs
     * @param newJobs
     * @returns {*} merged jobs
     */
    mergeJobs: function (existingJobs, newJobs) {
      for (var key in newJobs) {
        existingJobs[key] = newJobs[key];
      }
      return existingJobs;
    }

  };

  module.exports = DataGenerator;
}());