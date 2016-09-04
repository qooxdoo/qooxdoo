/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: http://opensource.org/licenses/MIT.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var async = require('async');
var esprima = require("esprima");
var escodegen = require("escodegen");
var qx = require("qooxdoo");
var xml2js = require('xml2js');
var util = require("./util");

var log = util.createLog("analyser");

var GLOBAL_SYMS = [ "Math", "Array", "document", "window", "Error", "Object", "String", "navigator", "arguments",
  "RegExp", "JSON", "eval", "Date", "console", "qx.$$resources", "qx.$$libraries", "qx.$$domReady", "qx.$$loader",
  "qx.$$translations", "qx.$$locales", "qx.$$start", "qx.$$environment", "XPathResult" ];

/**
 * Entry point for analysing source files; maintains a list of known libraries
 * (eg Qx app, contrib, Qx framework etc), known classes (and the files and
 * library in which the class is defined, and environment checks which have been
 * used (env checks imply a dependency).
 */
qx.Class.define("qxanalyser.Analyser", {
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String} the name of the database, defaults to "db.json"
   */
  construct : function(dbFilename) {
    this.base(arguments);

    this.__dbFilename = dbFilename || "db.json";
    this.__libraries = [];
    this.__classes = [];
    this.__locales = [ "en" ];
    this.__packages = {};
    this.__classFiles = {};
    this.__environmentChecks = {};
  },

  properties : {
    trackLineNumbers : {
      check : "Boolean",
      init : true,
      nullable : false
    },

    buildType : {
      init : "source",
      nullable : false,
      check : [ "source" ]
    },

    processResources : {
      init : true,
      nullable : false,
      check : "Boolean"
    }
  },

  members : {
    __resManager : null,
    __dbFilename : null,
    __db : null,
    __libraries : null,
    __classes : null,
    __locales : null,

    __packages : null,
    __classFiles : null,
    __environmentChecks : null,
    __inDefer : false,

    /**
     * Runs the whole process - loads the database, scans the files, calculates
     * dependencies, and then saves the database
     *
     * @param callback
     */
    run : function(callback) {
      var t = this;
      var resManager = null;
      if (this.isProcessResources()) {
        resManager = new qxanalyser.ResourceManager();
        this.__libraries.forEach(function(library) {
          resManager.addLibrary(library);
        });
      }
      this.__resManager = resManager;

      async.series(
        [
          // Load the databases
          function(callback) {
            async.parallel([ function(callback) {
              t.loadDatabase(callback);
            },

            function(callback) {
              log.debug("Loading resource database");
              if (resManager)
                resManager.loadDatabase(callback);
              else
                return callback(null);
            } ], callback);
          },

          // Scan the files
          function(callback) {
            log.debug("Scanning source code");
            t.scan(callback);
          },

          // Save
          function(callback) {
            log.debug("Saving database");
            t.saveDatabase(callback);
          }
        ],
        callback);
    },

    /**
     * Loads the database if available
     *
     * @param callback
     */
    loadDatabase : function(callback) {
      var t = this;
      async.waterfall([
      /**
       * Reads the db.json, if it exists
       *
       * @param callback
       */
      function readDb(callback) {
        fs.exists(t.__dbFilename, function(exists) {
          if (exists)
            fs.readFile(t.__dbFilename, { encoding: "utf-8" }, callback);
          else
            callback(null, null);
        });
      },

      /**
       * Parses the db.json into db
       *
       * @param data
       * @param callback
       */
      function parseDb(data, callback) {
        if (data && data.trim().length) {
          log.debug("Parsing database");
          t.__db = JSON.parse(data);
        } else {
          log.debug("No database to parse");
          t.__db = {};
        }
        callback(null, t.__db);
      } ],

      function(err, result) {
        log.debug("loaded database: err=" + err);
        callback();
      });
    },

    /**
     * Saves the database
     *
     * @param callback
     */
    saveDatabase : function(callback) {
      var t = this;
      log.debug("saving generator database");
      fs.writeFile(this.__dbFilename, JSON.stringify(t.__db, null, 2), function(err) {
        if (err)
          return callback(err);
        if (t.__resManager)
          t.__resManager.saveDatabase(callback);
        else
          callback(null);
      });
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase : function() {
      return this.__db;
    },

    /**
     * Scans the source files for javascript class and resource references and
     * calculates the dependency tree
     *
     * @param callback
     */
    scan : function(callback) {
      var t = this;
      async.parallel(
        [
          // Load locale
          function(callback) {
            t.checkLoadLocales(callback);
          },

          // Load Resources
          function(callback) {
            if (!t.__resManager)
              return callback(null);

            t.__resManager.findAllResources(function(err) {
              if (err)
                return callback(err);
              log.debug("found all resources");
              callback(null);
            });
          },

          // Load Javascript
          function(callback) {
            t.analyseClasses(callback);
          }
        ],
        function(err) {
          if (err)
            throw err;
          log.debug("processed source and resources");
          callback(null);
        });
    },

    /**
     * Parses all the source files recursively until all classes and all
     * dependent classes are loaded
     *
     * @param callback
     */
    analyseClasses : function(callback) {
      var t = this;
      var db = this.__db;
      t.findClassesInLibraries(this.__libraries, function(err) {
        var classIndex = 0;
        var classes = t.__classes;

        function add(className) {
          if (classes.indexOf(className) == -1)
            t.addClass(className);
        }

        /**
         * Loads the next class in the array or quits if there are no more
         */
        function next() {
          if (classIndex < classes.length) {
            var name = classes[classIndex];
            var m = name.match(/^([^*]+)\*/);
            if (m) {
              qx.lang.Array.removeAt(classes, classIndex);
              var partial = m[1];
              for (var tmp in t.__classFiles)
                if (tmp.length > partial.length && tmp.substring(0, partial.length) == partial && classes.indexOf(tmp) == -1)
                  qx.lang.Array.insertAt(classes, tmp, classIndex);
              return next();
            }
            classIndex++;
            loadClass(name);
          } else
            callback(null);
        }

        /**
         * Loads a class
         */
        function loadClass(className) {
          var classFileInfo = t.getClassFile(className);

          if (!classFileInfo) {
            log.debug("Cannot find file for " + className);
            return next();
          }

          // One day, this could include pre-processors
          function findJsSourcePath() {
            for (var i = 0; i < classFileInfo.paths.length; i++) {
              if (classFileInfo.paths[i].match(/\.js$/))
                return classFileInfo.paths[i];
            }
            return null;
          }

          var classFileName = findJsSourcePath();
          if (!classFileName)
            return next();

          if (!db.classInfo)
            db.classInfo = {};

          var dbClassInfo = db.classInfo[className];

          // Detect whether we need to rescan the file
          fs.stat(classFileName, function(err, stat) {
            if (err)
              throw err;

            if (dbClassInfo) {
              var dbMtime = null;
              try {
                dbMtime = dbClassInfo.mtime && new Date(dbClassInfo.mtime);
              } catch (e) {
              }
              if (dbMtime && dbMtime.getTime() == stat.mtime.getTime()) {
                var deps = dbClassInfo.dependsOn;
                for (var depName in deps)
                  add(depName);
                return next();
              }
            }

            // Add database entry
            dbClassInfo = db.classInfo[className] = {
              mtime : stat.mtime,
              libraryName : classFileInfo.libraryName
            };

            // Analyse it and collect unresolved symbols and dependencies
            var classDef = new qxanalyser.ClassFile(t, className, classFileName);
            classDef.load(function (err) {
              if (err)
                throw err;

              // Collect the list of unresolved symbols
              var unresolvedSymbols = classDef.getUnresolvedSymbols();
              var shownFilename = false;
              for ( var name in unresolvedSymbols) {
                if (!shownFilename) {
                  log.trace("Loading " + className);
                  shownFilename = true;
                }
                if (!dbClassInfo.unresolved)
                  dbClassInfo.unresolved = [];
                var sym = unresolvedSymbols[name];
                var str = "Unresolved Symbol in " + className + ": " + name;
                for (var j = 0; j < sym.locations.length; j++)
                  str += ", line " + sym.locations[j].start.line;
                log.debug(str);
                dbClassInfo.unresolved.push(unresolvedSymbols[name]);
              }

              // Collect the dependencies on other classes
              var deps = classDef.getRequiredClasses();
              for ( var name in deps) {
                var dep = deps[name];
                if (!dep.ignore) {
                  if (!dbClassInfo.dependsOn)
                    dbClassInfo.dependsOn = {};
                  dbClassInfo.dependsOn[name] = dep;
                  if (classes.indexOf(name) < 0)
                    add(name);
                }
              }

              // Save whether the class has a defer method
              dbClassInfo.hasDefer = classDef.hasDefer();

              var assets = classDef.getAssets();
              if (assets.length)
                dbClassInfo.assets = assets;

              // Next!
              next();
            });
          });
        }

        next();
      });
    },

    /**
     * Loads the locales referred to by the config, unless they are already in
     * the database
     *
     * @param callback
     */
    checkLoadLocales : function(callback) {
      var t = this;
      var db = this.__db;
      if (!db.cldr)
        db.cldr = {};
      async.map(this.__locales, function(locale, callback) {
        if (!db.cldr[locale]) {
          t.loadCLDR(locale, function(err, cldr) {
            if (err)
              throw err;
            db.cldr[locale] = cldr;
            callback(null);
          });
        } else
          callback(null);
      }, function() {
        callback(null);
      });
    },

    /**
     * Returns the path to the qooxdoo library
     *
     * @returns
     */
    getQooxdooPath : function() {
      for (var i = 0; i < this.__libraries.length; i++) {
        var library = this.__libraries[i];
        if (library.libraryName == "qx")
          return library.rootDir;
      }
      return null;
    },

    /**
     * Loads CLDR data from the Qx framework
     *
     * @param locale
     * @param done
     */
    loadCLDR : function(locale, done) {
      var parser = new xml2js.Parser();
      log.debug("Loading CLDR, qx=" + this.getQooxdooPath());
      fs.readFile(path.join(this.getQooxdooPath(), "../tool/data/cldr/main", locale + ".xml"), { encoding: "utf-8" }, function(err, data) {
        if (err)
          return done(err);
        parser.parseString(data, function(err, src) {
          if (err)
            return done(err);

          function find(arr, name, value, cb) {
            for (var i = 0; i < arr.length; i++) {
              var row = arr[i];
              if (row["@"] && row["@"][name] == value) {
                if (typeof cb == "function")
                  return cb(row);
                return row;
              }
            }
            return null;
          }

          var cal = find(src.dates.calendars.calendar, "type", "gregorian");

          var cldr = {};
          cldr.alternateQuotationEnd = src.delimiters.alternateQuotationEnd;
          cldr.alternateQuotationStart = src.delimiters.alternateQuotationStart;
          cldr.quotationEnd = src.delimiters.quotationEnd;// "���";
          cldr.quotationStart = src.delimiters.quotationStart;// "���";

          function getText(row) {
            return row["#"];
          }
          function getDateFormatPattern(row) {
            return row.dateFormat.pattern;
          }

          find(cal.dayPeriods.dayPeriodContext.dayPeriodWidth, "type", "wide", function(row) {
            cldr.cldr_am = find(row.dayPeriod, "type", "am", getText);
            cldr.cldr_pm = find(row.dayPeriod, "type", "pm", getText);// "PM";
          });

          cldr.cldr_date_format_full = find(cal.dateFormats.dateFormatLength, "type", "full",
            getDateFormatPattern);// "EEEE, MMMM d, y";
          cldr.cldr_date_format_long = find(cal.dateFormats.dateFormatLength, "type", "long",
            getDateFormatPattern);// "MMMM d, y";
          cldr.cldr_date_format_medium = find(cal.dateFormats.dateFormatLength, "type", "medium",
            getDateFormatPattern);// "MMM d, y";
          cldr.cldr_date_format_short = find(cal.dateFormats.dateFormatLength, "type", "short",
            getDateFormatPattern);// "M/d/yy";
          cldr.cldr_date_time_format_Ed = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "Ed",
            getText);// "d E";
          cldr.cldr_date_time_format_Hm = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "Hm",
            getText);// "HH:mm";
          cldr.cldr_date_time_format_Hms = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "Hms",
            getText);// "HH:mm:ss";
          cldr.cldr_date_time_format_M = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "M",
            getText);// "L";
          cldr.cldr_date_time_format_MEd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "MEd",
            getText);// "E, M/d";
          cldr.cldr_date_time_format_MMM = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "MMM",
            getText);// "LLL";
          cldr.cldr_date_time_format_MMMEd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "MMMEd", getText);// "E, MMM d";
          cldr.cldr_date_time_format_MMMd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "MMMd", getText);// "MMM d";
          cldr.cldr_date_time_format_Md = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "Md",
            getText);// "M/d";
          cldr.cldr_date_time_format_d = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "d",
            getText);// "d";
          cldr.cldr_date_time_format_hm = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "hm",
            getText);// "h:mm a";
          cldr.cldr_date_time_format_hms = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "hms",
            getText);// "h:mm:ss a";
          cldr.cldr_date_time_format_ms = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "ms",
            getText);// "mm:ss";
          cldr.cldr_date_time_format_y = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "y",
            getText);// "y";
          cldr.cldr_date_time_format_yM = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "yM",
            getText);// "M/y";
          cldr.cldr_date_time_format_yMEd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "yMEd", getText);// "E, M/d/y";
          cldr.cldr_date_time_format_yMMM = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "yMMM", getText);// "MMM y";
          cldr.cldr_date_time_format_yMMMEd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "yMMMEd", getText);// "E, MMM d, y";
          cldr.cldr_date_time_format_yMMMd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "yMMMd", getText);// "MMM d, y";
          cldr.cldr_date_time_format_yMd = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "yMd",
            getText);// "M/d/y";
          cldr.cldr_date_time_format_yQ = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id", "yQ",
            getText);// "Q y";
          cldr.cldr_date_time_format_yQQQ = find(cal.dateTimeFormats.availableFormats.dateFormatItem, "id",
            "yQQQ", getText);// "QQQ y";
          find(cal.days.dayContext, "type", "format", function(row) {
            find(row.dayWidth, "type", "abbreviated", function(row) {
              cldr.cldr_day_format_abbreviated_fri = find(row.day, "type", "fri", getText);// "Fri";
              cldr.cldr_day_format_abbreviated_mon = find(row.day, "type", "mon", getText);// "Mon";
              cldr.cldr_day_format_abbreviated_sat = find(row.day, "type", "sat", getText);// "Sat";
              cldr.cldr_day_format_abbreviated_sun = find(row.day, "type", "sun", getText);// "Sun";
              cldr.cldr_day_format_abbreviated_thu = find(row.day, "type", "thu", getText);// "Thu";
              cldr.cldr_day_format_abbreviated_tue = find(row.day, "type", "tue", getText);// "Tue";
              cldr.cldr_day_format_abbreviated_wed = find(row.day, "type", "wed", getText);// "Wed";
            });
          });
          find(cal.days.dayContext, "type", "format", function(row) {
            find(row.dayWidth, "type", "wide", function(row) {
              cldr.cldr_day_format_wide_fri = find(row.day, "type", "fri", getText);// "Friday";
              cldr.cldr_day_format_wide_mon = find(row.day, "type", "mon", getText);// "Monday";
              cldr.cldr_day_format_wide_sat = find(row.day, "type", "sat", getText);// "Saturday";
              cldr.cldr_day_format_wide_sun = find(row.day, "type", "sun", getText);// "Sunday";
              cldr.cldr_day_format_wide_thu = find(row.day, "type", "thu", getText);// "Thursday";
              cldr.cldr_day_format_wide_tue = find(row.day, "type", "tue", getText);// "Tuesday";
              cldr.cldr_day_format_wide_wed = find(row.day, "type", "wed", getText);// "Wednesday";
            });
          });
          find(cal.days.dayContext, "type", "stand-alone", function(row) {
            cldr["cldr_day_stand-alone_narrow_fri"] = find(row.dayWidth.day, "type", "fri", getText);// "F";
            cldr["cldr_day_stand-alone_narrow_mon"] = find(row.dayWidth.day, "type", "mon", getText);// "M";
            cldr["cldr_day_stand-alone_narrow_sat"] = find(row.dayWidth.day, "type", "sat", getText);// "S";
            cldr["cldr_day_stand-alone_narrow_sun"] = find(row.dayWidth.day, "type", "sun", getText);// "S";
            cldr["cldr_day_stand-alone_narrow_thu"] = find(row.dayWidth.day, "type", "thu", getText);// "T";
            cldr["cldr_day_stand-alone_narrow_tue"] = find(row.dayWidth.day, "type", "tue", getText);// "T";
            cldr["cldr_day_stand-alone_narrow_wed"] = find(row.dayWidth.day, "type", "wed", getText);// "W";
          });
          find(cal.months.monthContext, "type", "format", function(row) {
            find(row.monthWidth, "type", "abbreviated", function(row) {
              for (var i = 0; i < row.month.length; i++) {
                var m = row.month[i];
                cldr["cldr_month_format_abbreviated_" + m["@"].type] = m["#"];
              }
            });
          });
          find(cal.months.monthContext, "type", "format", function(row) {
            find(row.monthWidth, "type", "wide", function(row) {
              for (var i = 0; i < row.month.length; i++) {
                var m = row.month[i];
                cldr["cldr_month_format_wide_" + m["@"].type] = m["#"];
              }
            });
          });
          find(cal.months.monthContext, "type", "stand-alone", function(row) {
            for (var i = 0; i < row.monthWidth.month.length; i++) {
              var m = row.monthWidth.month[i];
              cldr["cldr_month_stand-alone_narrow_" + m["@"].type] = m["#"];
            }
          });

          cldr.cldr_number_decimal_separator = src.numbers.symbols.decimal;// ".";
          cldr.cldr_number_group_separator = src.numbers.symbols.group;// ",";
          cldr.cldr_number_percent_format = src.numbers.percentFormats.percentFormatLength.percentFormat.pattern;// "#,##0%";

          function getTimeFormatPattern(row) {
            return row.timeFormat.pattern;
          }

          cldr.cldr_time_format_full = find(cal.timeFormats.timeFormatLength, "type", "full",
            getTimeFormatPattern);// "h:mm:ss a zzzz";
          cldr.cldr_time_format_long = find(cal.timeFormats.timeFormatLength, "type", "long",
            getTimeFormatPattern);// "h:mm:ss a z";
          cldr.cldr_time_format_medium = find(cal.timeFormats.timeFormatLength, "type", "medium",
            getTimeFormatPattern);// "h:mm:ss a";
          cldr.cldr_time_format_short = find(cal.timeFormats.timeFormatLength, "type", "short",
            getTimeFormatPattern);// "h:mm a";

          function getDisplayName(row) {
            return row.displayName;
          }
          cldr.day = find(src.dates.fields.field, "type", "day", getDisplayName);// "Day"
          cldr.dayperiod = find(src.dates.fields.field, "type", "dayperiod", getDisplayName);// "AM/PM";
          cldr.era = find(src.dates.fields.field, "type", "era", getDisplayName);// "Era";
          cldr.hour = find(src.dates.fields.field, "type", "hour", getDisplayName);// "Hour";
          cldr.minute = find(src.dates.fields.field, "type", "minute", getDisplayName);// "Minute";
          cldr.month = find(src.dates.fields.field, "type", "month", getDisplayName);// "Month";
          cldr.second = find(src.dates.fields.field, "type", "second", getDisplayName);// "Second";
          cldr.week = find(src.dates.fields.field, "type", "week", getDisplayName);// "Week";
          cldr.weekday = find(src.dates.fields.field, "type", "weekday", getDisplayName);// "Day
          // of
          // the
          // Week";
          cldr.year = find(src.dates.fields.field, "type", "year", getDisplayName);// "Year";
          cldr.zone = find(src.dates.fields.field, "type", "zone", getDisplayName);// "Time
          // Zone";

          done(null, cldr);
        });
      });
    },

    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary : function(library) {
      this.__libraries.push(library);
    },

    /**
     * Adds a required class
     *
     * @param classname
     */
    addClass : function(classname) {
      this.__classes.push(classname);
    },

    /**
     * Adds a required Locale
     *
     * @param locale
     */
    addLocale : function(locale) {
      this.__locales.push(locale);
    },

    /**
     * Returns the list of locale IDs
     */
    getLocales: function() {
      return this.__locales;
    },

    /**
     * Called recursively to scan a folder and locate classes. Note that this
     * simply locates the available classes and compiles a list of known
     * packages - classes are not analysed
     *
     * @param dir
     *          {String} folder to scan
     * @param namespace
     *          {String} the package namespace for the folder
     * @param libraryName
     *          {String} the name of the parent library
     * @param done
     *          {Function} method to call when complete
     */
    _findClassesInFolder : function(dir, namespace, libraryName, done) {
      var t = this;

      fs.exists(dir, function(exists) {
        if (!exists) {
          log.info("Cannot find folder " + dir + " when searching for classes");
          return done(null);
        }
        fs.readdir(dir, function(err, list) {
          if (err)
            return done(err);

          var listIndex = 0;
          function next() {
            var file = list[listIndex++];
            if (!file)
              return done(null);

            var absFile = dir + '/' + file;

            fs.stat(absFile, function(err, stat) {

              // Directory
              if (stat && stat.isDirectory()) {
                if (file.match(/^\./)) {
                  next();

                } else {
                  // Recurse
                  var nextNamespace = ((namespace && namespace.length) ? (namespace + ".") : "") + file;
                  t._findClassesInFolder(absFile, nextNamespace, libraryName, function(err) {
                    next();
                  });
                }
              } else {
                var match = file.match(/(.*)(\.\w+)$/);
                if (!match) {
                  log.trace("Skipping file " + absFile);
                  next();
                } else {
                  var nextNamespace = ((namespace && namespace.length) ? (namespace + ".") : "") + match[1];
                  var classFileInfo = t.__classFiles[nextNamespace];
                  if (!classFileInfo) {
                    classFileInfo = t.__classFiles[nextNamespace] = {
                      className : nextNamespace,
                      paths : [ absFile ],
                      libraryName : libraryName
                    };
                  } else
                    classFileInfo.paths.push(absFile);
                  var segs = nextNamespace.split("."), str = "";
                  for (var i = 0; i < segs.length - 1; i++) {
                    if (i)
                      str += ".";
                    str += segs[i];
                    t.__packages[str] = true;
                  }
                  next();
                }
              }
            });
          }

          next();
        });
      });
    },

    /**
     * Scans a list of libraries
     *
     * @param libraries
     *          {Map|Map[]} Map of library definition, containing: rootDir
     *          {String} root path of the library sourcePath {String} path to
     *          Javascript source within rootDir libraryName {String} the name
     *          of the library
     * @param ready
     */
    findClassesInLibraries : function(libraries, ready) {
      if (!Array.isArray(libraries))
        libraries = [ libraries ];
      var numScanned = 0;
      for (var i = 0; i < libraries.length; i++)
        this._findClassesInFolder(libraries[i].rootDir + '/' + libraries[i].sourcePath, null, libraries[i].libraryName,
          function(err) {
            if (err)
              return ready(err);
            numScanned++;
            if (numScanned == libraries.length)
              ready(null);
          });
    },

    /**
     * Returns the known classes
     *
     * @returns
     */
    getClassFiles : function() {
      return this.__classFiles;
    },

    /**
     * Returns a specific class
     *
     * @param className
     * @returns
     */
    getClassFile : function(className) {
      return this.__classFiles[className];
    },

    /**
     * Tests whether name is a known package
     *
     * @param name
     * @returns {Boolean}
     */
    isPackageName : function(name) {
      return this.__packages[name] !== undefined;
    },

    /**
     * Sets an environment value as being checked for
     *
     * @param key
     * @param value
     */
    setEnvironmentCheck : function(key, value) {
      this.__environmentChecks[key] = value;
    },

    /**
     * Tests whether an environment value is checked for
     *
     * @param key
     * @returns
     */
    getEnvironmentCheck : function(key) {
      return this.__environmentChecks[key];
    },

    /**
     * Returns the resource manager
     */
    getResourceManager: function() {
      return this.__resManager;
    }
  }
});

qx.Class.define("qxanalyser.Application", {
  extend : qx.core.Object,

  construct : function(analyser, classes) {
    this.base(arguments);
    this.__analyser = analyser;
    this.__classes = classes;
  },

  members : {
    __loadDeps : null,
    __runtimeDeps : null,
    __deferDeps : null,

    /**
     * Calculates the dependencies of the classes to create a load order
     *
     * @param classes
     */
    calcDependencies : function(callback) {
      var t = this;
      var db = this.__analyser.getDatabase();
      var loadDeps = this.__loadDeps = [];
      var allDeps = loadDeps;
      var deferDeps = this.__deferDeps = [];
      var runtimeDeps = this.__runtimeDeps = [];

      var notYetDependedOn = [];
      var i = 0;

      // Copy all of the class definitions into notYetDependedOn;
      // notYetDependedOn is
      // depleted as the load order is determined
      for ( var className in db.classInfo) {
        var info = notYetDependedOn[i++] = {
          className : className,
          neededFor : {}
        };
        var src = db.classInfo[className];
        if (src)
          for ( var name in src)
            info[name] = src[name];
      }

      notYetDependedOn = notYetDependedOn.sort(function(left, right) {
        return left.className < right.className ? -1 : left.className > right.className ? 1 : 0;
      });

      /**
       * Finds the class definition in notYetDependedOn
       *
       * @param className
       * @returns
       */
      function getNYDO(className) {
        for (var i = 0; i < notYetDependedOn.length; i++) {
          var info = notYetDependedOn[i];
          if (info.className == className) {
            return info;
          }
        }
        return null;
      }

      var needed = [];
      var neededIndex = 0;
      var stack = [];

      function addDep(className) {
        if (allDeps.indexOf(className) > -1 || stack.indexOf(className) > -1)
          return;

        var info = getNYDO(className);
        if (!info)
          return;

        var deps = info.dependsOn;
        if (deps) {
          stack.push(className);
          for (var depName in deps) {
            if (deps[depName].load || deps[depName].require) {
              addDep(depName);
            } else if (allDeps.indexOf(depName) == -1 && needed.indexOf(depName) == -1)
              needed.push(depName);
          }
          qx.lang.Array.remove(stack, className);
        }

        allDeps.push(className);
      }

      // Start the ball rolling
      addDep("qx.lang.Object");
      for (var i = 0; i < t.__classes.length; i++)
        addDep(t.__classes[i]);

      while (neededIndex < needed.length) {
        var className = needed[neededIndex++];
        addDep(className);
      }

      if (callback)
        callback();
    },

    getUris : function() {
      var uris = [];
      var loadDeps = this.__loadDeps;
      var runtimeDeps = this.__runtimeDeps;
      var deferDeps = this.__deferDeps;
      var db = this.__analyser.getDatabase();

      for (var i = 0; i < loadDeps.length; i++) {
        var className = loadDeps[i];
        var def = db.classInfo[className];
        uris.push(def.libraryName + ":" + className.replace(/\./g, "/") + ".js");
      }
      for (var i = 0; i < deferDeps.length; i++) {
        var className = deferDeps[i];
        var def = db.classInfo[className];
        uris.push(def.libraryName + ":" + className.replace(/\./g, "/") + ".js");
      }
      for (var i = 0; i < runtimeDeps.length; i++) {
        var className = runtimeDeps[i];
        var def = db.classInfo[className];
        uris.push(def.libraryName + ":" + className.replace(/\./g, "/") + ".js");
      }

      return uris;
    },

    /**
     * Returns a list of all of the assets required by all classes
     */
    getAssets: function() {
      var assets = [];
      var db = this.__analyser.getDatabase();

      // Check all the classes
      var classNames = this.__loadDeps.concat(this.__runtimeDeps, this.__deferDeps);
      for (var i = 0; i < classNames.length; i++) {
        var classInfo = db.classInfo[classNames[i]];
        var tmp = classInfo.assets;
        if (tmp)
          assets.push.apply(assets, tmp);
      }

      // Remove duplicates and overlapping path wildcards
      assets.sort();
      for (var i = 1; i < assets.length; i++) {
        var asset = assets[i];
        var lastAsset = assets[i - 1];

        if (asset == lastAsset) {
          assets.splice(i--, 1);
          continue;
        }

        if (lastAsset[lastAsset.length - 1] == '*') {
          var path = lastAsset.substring(0, lastAsset.length - 1);
          if (asset.substring(0, path.length) == path) {
            assets.splice(i--, 1);
            continue;
          }
        }
      }

      return assets;
    }

  }
});

/**
 * A class file is parsed and anaysed into an instance of ClassFile; it is
 * connected to the Analyser that found the class so that dependencies can be
 * identified.
 */
qx.Class.define("qxanalyser.ClassFile", {
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param analyser
   *          {Analyser} the Analyser that found the file
   * @param className
   *          {String} the full name of the class
   * @param path
   *          {String} the path to the file
   */
  construct : function(analyser, className, path) {
    this.base(arguments);

    this.__analyser = analyser;
    this.__className = className;
    this.__path = path;

    this.__requiredClasses = {};
    this.__environmentChecks = {};
    this.__requiredAssets = [];

    this.__scope = {
      parent : null,
      vars : [],
      unresolved : []
    };

  },

  members : {

    __inDefer : false,

    /**
     * Loads the source and analyses the code
     *
     * @param callback
     *          {Function} callback for when the load is completed
     */
    load : function(callback) {
      var t = this;
      var analyser = this.__analyser;

      fs.readFile(this.__path, { encoding: "utf-8" }, function(err, src) {
        if (err)
          return callback(err);

        var ast = esprima.parse(src, {
          tolerant : true,
          comment : true,
          loc : analyser.isTrackLineNumbers()
        });
        t._scanNode(ast);

        for (var name in t.__environmentChecks) {
          var value = qx.core.Environment._checksMap[name] || analyser.getEnvironmentCheck(name);
          if (value) {
            var segs = value.split(".");
            segs.pop();
            var className = segs.join(".");
            if (analyser.getClassFile(className))
              t._requireClass(className);
          }
        }

        return callback(null);
      });
    },

    /**
     * Pushes a new scope on the stack
     */
    pushScope : function() {
      this.__scope = {
        parent : this.__scope,
        vars : [],
        unresolved : []
      };
    },

    /**
     * Pops a scope from the stack
     */
    popScope : function() {
      var old = this.__scope, scope = this.__scope = this.__scope.parent, unresolved = scope.unresolved;
      for ( var name in old.unresolved) {
        var entry = unresolved[name];
        if (!entry)
          entry = unresolved[name] = {
            name : name,
            locations : []
          };
        entry.locations.push.apply(entry.locations, old.unresolved[name].locations);
      }
    },

    /**
     * Tests whether the current scope is load-time scope
     *
     * @returns {Boolean}
     */
    isLoadScope : function() {
      return this.__inDefer || !this.__scope.parent;
    },

    /**
     * Tests whether this class has a defer method
     *
     * @returns {Boolean}
     */
    hasDefer : function() {
      return this.__hasDefer;
    },

    /**
     * Adds a variable declaration to the current scope; if the symbol was
     * previously "unresolved" it is removed from the unresolved list
     *
     * @param name
     */
    addDeclaration : function(name) {
      if (this.__scope.vars[name] === undefined) {
        this.__scope.vars[name] = true;
        var unresolved = this.__scope.unresolved;
        delete unresolved[name];
        var re = new RegExp(name + "\\.");
        for ( var tmp in unresolved)
          if (re.test(tmp))
            delete unresolved[tmp];
      }
    },

    /**
     * Tests whether there is a variable declaration accessible to the current
     * scope, ie including parent scope
     *
     * @param name
     * @returns {Boolean}
     */
    hasDeclaration : function(name) {
      for (var tmp = this.__scope; tmp; tmp = tmp.parent)
        if (tmp.vars[name] !== undefined)
          return true;
      return false;
    },

    /**
     * Adds a reference to a symbol; unknown symbols are marked as unresolved
     *
     * @param name
     * @param loc
     */
    addReference : function(name, loc) {
      if (Array.isArray(name))
        name = name.join(".");
      var scope = this.__scope;
      if (scope.vars[name] !== undefined)
        return;
      if (!scope.unresolved[name])
        scope.unresolved[name] = {
          name : name,
          locations : loc ? [ loc ] : []
        };
      else if (loc)
        scope.unresolved[name].locations.push(loc);
    },

    /**
     * Adds a required class
     *
     * @param name
     * @param where
     */
    _requireClass : function(name, where) {
      if (name == this.__className)
        return;
      if (!name)
        throw new Error("No classname");
      var data = this.__requiredClasses[name];
      if (!data)
        data = this.__requiredClasses[name] = {};

      if (where !== undefined) {
        if (where == "ignore")
          data.ignore = true;
        else if (where == "require")
          data.require = true;
        else if (data == "use")
          data.load = !!data.load;
      } else {
        if (!data.load)
          data.load = this.isLoadScope();
        if (!data.defer && this.__inDefer)
          data.defer = "load";
      }
    },

    /**
     * Adds a required asset
     * @param path
     */
    _requireAsset: function(path) {
      if (!qx.lang.Array.contains(this.__requiredAssets, path))
        this.__requiredAssets.push(path);
    },

    /**
     * Returns the assets required by the class
     * @returns
     */
    getAssets: function() {
      return this.__requiredAssets;
    },

    /**
     * Scans an Esprima node, recursively
     *
     * @param node
     *          {EsprimaNode}
     */
    _scanNode : function(node) {
      if (node === undefined || !node) {
        return;
      }
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++)
          this._scanNode(node[i]);
        return;
      }

      if (!node.type) {
        console.trace("No node type: " + JSON.stringify(node) + " -> " + typeof node);
        return;
      }

      switch (node.type) {
      case "Program":
        this._scanNode(node.body);
        if (node.comments)
          for (var i = 0; i < node.comments.length; i++) {
            var comment = node.comments[i].value;
            var lines = comment.split('\n');
            for (var j = 0; j < lines.length; j++) {
              var match = lines[j].match(/[\s*]@(\w+)\(([^)]*)\)/);
              if (match)
                switch (match[1]) {
                case "use":
                  this._requireClass(match[2].replace(/#.*/, ""), "use");
                  break;

                case "require":
                  this._requireClass(match[2].replace(/#.*/, ""), "require");
                  break;

                case "optional":
                case "ignore":
                  this._requireClass(match[2], "ignore");
                  break;

                case "asset":
                  this._requireAsset(match[2]);
                  break;
                }
            }
          }
        break;

      case "Function":
        this._scanNode(node.params);
        this._scanNode(node.defaults);
        this._scanNode(node.body);
        break;

      /*
       * Statements
       */

      case "EmptyStatement":
      case "BreakStatement":
      case "ContinueStatement":
      case "DebuggerStatement":
        break;

      case "BlockStatement":
        this._scanNode(node.body);
        break;

      case "ExpressionStatement":
        this._scanNode(node.expression);
        break;

      case "IfStatement":
        this._scanNode(node.test);
        this._scanNode(node.consequent);
        if (node.alternate)
          this._scanNode(node.alternate);
        break;

      case "LabeledStatement":
        this._scanNode(node.body);
        break;

      case "WithStatement":
        this._scanNode(node.object);
        this._scanNode(node.body);
        break;

      case "SwitchStatement":
        this._scanNode(node.discriminant);
        this._scanNode(node.cases);
        break;

      case "ReturnStatement":
        this._scanNode(node.argument);
        break;

      case "ThrowStatement":
        this._scanNode(node.argument);
        break;

      case "TryStatement":
        this._scanNode(node.block);
        this._scanNode(node.handlers);
        this._scanNode(node.finalizer);
        break;

      case "WhileStatement":
      case "DoWhileStatement":
        this._scanNode(node.test);
        this._scanNode(node.body);
        break;

      case "ForStatement":
        if (node.init && /Expression|VariableDeclaration/.test(node.init.type))
          this._scanNode(node.init);
        this._scanNode(node.test);
        this._scanNode(node.update);
        this._scanNode(node.body);
        break;

      case "ForInStatement":
        if (node.left && /Expression|VariableDeclaration/.test(node.left.type))
          this._scanNode(node.left);
        this._scanNode(node.right);
        this._scanNode(node.body);
        break;

      case "LetStatement":
        var lst = node.head;
        if (lst)
          for (var i = 0; i < lst.length; i++) {
            this._scanNode(lst[i].id);
            this._scanNode(lst[i].init);
          }
        this._scanNode(node.body);
        break;

      /*
       * Expressions
       */
      case "ArrayExpression":
        this._scanNode(node.elements);
        break;

      case "ObjectExpression":
        this._scanNode(node.properties);
        break;

      case "SequenceExpression":
        this._scanNode(node.expressions);
        break;

      case "UnaryExpression":
      case "UpdateExpression":
        this._scanNode(node.argument);
        break;

      case "BinaryExpression":
      case "AssignmentExpression":
      case "LogicalExpression":
        this._scanNode(node.left);
        this._scanNode(node.right);
        break;

      case "ConditionalExpression":
        this._scanNode(node.test);
        this._scanNode(node.alternate);
        this._scanNode(node.consequent);
        break;

      case "NewExpression":
        this._scanNode(node.callee);
        this._scanNode(node.arguments);
        if (this.__inDefer) {
          var str = escodegen.generate(node.callee);
          if (this.__analyser.getClassFile(str)) {
            this.__requiredClasses[str].defer = "runtime";
          }
        }
        break;

      case "CallExpression":
        this._scanNode(node.callee);

        var callee = escodegen.generate(node.callee);
        if (callee == "qx.Class.define" || callee == "qx.Mixin.define" || callee == "qx.Theme.define"
          || callee == "qx.Interface.define" || callee == "qx.Bootstrap.define") {
          this._onDefineClass(node, callee);
          break;
        }
        if (this.__inDefer) {
          var pos = callee.lastIndexOf('.');
          if (pos > -1) {
            var str = callee.substring(0, pos);
            if (this.__analyser.getClassFile(str)) {
              this.__requiredClasses[str].defer = "runtime";
            }
          }
        }

        this._scanNode(node.arguments);
        if (callee == "qx.core.Environment.select" || callee == "qx.core.Environment.get") {
          if (node.arguments[0].type == "Literal")
            this.__environmentChecks[node.arguments[0].value] = true;
        }
        break;

      case "MemberExpression":
        this._onMemberExpression(node);
        break;

      case "YieldExpression":
        this._scanNode(node.argument);
        break;

      case "ComprehensionExpression":
      case "GeneratorExpression":
        this._scanNode(node.body);
        var lst = node.blocks;
        if (lst)
          for (var i = 0; i < lst.length; i++)
            this._scanNode(lst[i].right);
        this._scanNode(node.filter);
        break;

      case "LetExpression":
        var lst = node.head;
        if (lst)
          for (var i = 0; i < lst.length; i++)
            this._scanNode(lst[i].init);
        this._scanNode(node.body);
        break;

      /*
       * Declarations
       */
      case "FunctionDeclaration":
      case "FunctionExpression":
        if (node.id)
          this.addDeclaration(node.id.name);
        this.pushScope();
        for (var i = 0; i < node.params.length; i++)
          this.addDeclaration(node.params[i].name);
        if (/Expression/.test(node.body.type))
          this._scanNode(node.body);
        else
          this._scanNode(node.body);
        this.popScope();
        break;

      case "VariableDeclaration":
        var lst = node.declarations;
        for (var i = 0; i < lst.length; i++) {
          this.addDeclaration(lst[i].id.name);
          this._scanNode(lst[i].id);
          this._scanNode(lst[i].init);
        }
        break;

      /*
       * Patterns
       */
      case "ObjectPattern":
        var lst = node.properties;
        for (var i = 0; i < lst.length; i++)
          this._scanNode(lst[i].value);
        break;

      case "ArrayPattern":
        this._scanNode(node.elements);
        break;

      /*
       * Clauses
       */
      case "SwitchCase":
        this._scanNode(node.test);
        this._scanNode(node.consequent);
        break;

      case "CatchClause":
        this.pushScope();
        this.addDeclaration(node.param.name);
        this._scanNode(node.guard);
        this._scanNode(node.body);
        this.popScope();
        break;

      case "ComprehensionBlock":
        this._scanNode(node.left);
        this._scanNode(node.right);
        break;

      case "Property":
        this._scanNode(node.key);
        this._scanNode(node.value);
        break;

      case "Literal":
      case "Identifier":
      case "ThisExpression":
        break;

      default:
        log.trace("Unrecognised node type: " + node.type);

        for ( var key in node) {
          if (node.hasOwnProperty(key)) {
            child = node[key];
            if (typeof child === 'object' && child !== null) {
              this._scanNode(child);
            }
          }
        }
      }
    },

    /**
     * Called when a class definition is encountered in he source, eg
     * qx.Class.define;
     *
     * @param node
     *          {EsprimaNode} the node that is the call to define()
     * @param callee
     *          {String} the call, eg "qx.Class.define"
     */
    _onDefineClass : function(node, callee) {
      var className = node.arguments[0].value, classDef = node.arguments[1];

      // if qx.Class.define is being called without an object (eg some variable) then
      //  we can't support that
      if (classDef.type != "ObjectExpression")
        return;

      for (var i = 0; i < classDef.properties.length; i++) {
        var prop = classDef.properties[i];
        if (prop.type == "Property") {
          switch (prop.key.name) {
          case "extend":
          case "implement":
          case "include":
          case "construct":
          case "destruct":
          case "environment":
            this._scanNode(prop.value);
            break;

          case "defer":
            this.__hasDefer = true;
            this.__inDefer = true;
            this._scanNode(prop.value);
            this.__inDefer = false;
            break;

          case "type":
          case "title":
            break;

          case "statics":
            if (className == "qx.core.Environment") {
              var checks = this.__findProperty(prop.value.properties, "_checksMap"), props = checks.value.properties;
              for (var j = 0; j < props.length; j++) {
                this.__analyser.setEnvironmentCheck(props[j].key.value, props[j].value.value);
              }
            }
            // continue on down...

          case "properties":
          case "events":
          case "members":
          case "meta":
          case "appearances":
          case "decorations":
          case "fonts":
          case "colors":
          case "aliases":
            var props = prop.value.properties;
            for (var j = 0; j < props.length; j++)
              this._scanNode(props[j].value);
            break;

          default:
            log.trace("prop.key.name=" + prop.key.name);
          }
        }
      }
    },

    /**
     * Member expression; mostly used to detect references causing dependencies
     *
     * @param node
     */
    _onMemberExpression : function(node) {
      var members = [], t = this;
      function getMembers(node) {
        if (node.object.type == "CallExpression") {
          members = null;
          t._scanNode(node.object);

        } else if (node.object.type == "NewExpression") {
          members = null;
          t._scanNode(node.object);

        } else if (node.object.type == "ObjectExpression") {
          members = null;
          t._scanNode(node.object);

        } else if (node.object.type == "LogicalExpression" || node.object.type == "BinaryExpression") {
          members = null;
          t._scanNode(node.object);

        } else if (node.object.type == "MemberExpression")
          getMembers(node.object);

        else if (node.object.type == "ThisExpression")
          members.push("this");

        else if (node.object.type == "Identifier")
          members.push(node.object.name);

        if (!members)
          return;
        members.push(node.property.name);
      }

      // regular expression or string property (eg "aa".charCodeAt())
      if (node.object.type == "Literal")
        return;

      getMembers(node);

      // Ignore 'this' references
      if (!members || members[0] == "this")
        return;

      // Check for classes
      if (this.__analyser.isPackageName(members.join(".")))
        return;
      var str = "";
      for (var i = 0; i < members.length; i++) {
        if (i > 0)
          str += ".";
        str += members[i];
        if (GLOBAL_SYMS.indexOf(str) > -1)
          return;
        if (this.__analyser.getClassFile(str)) {
          this._requireClass(str);
          return;
        }
      }

      // Check for local variables
      if (!this.hasDeclaration(members[0]))
        this.addReference(members, node.loc);
    },

    /**
     * Finds an object property in a node tree (not a Qooxdoo property, an
     * object property)
     *
     * @param props
     * @param name
     * @returns
     */
    __findProperty : function(props, name) {
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (prop.type == "Property" && prop.key.type == "Identifier" && prop.key.name == name)
          return prop;
      }
      return null;
    },

    /**
     * Returns the list of required classes (dependencies)
     *
     * @returns
     */
    getRequiredClasses : function() {
      return this.__requiredClasses;
    },

    /**
     * Returns a list of unresolved symbols
     *
     * @returns
     */
    getUnresolvedSymbols : function() {
      return this.__scope.unresolved;
    }
  }

});

/**
 * Analyses library resources, collecting information into a cached database
 * file
 */
qx.Class.define("qxanalyser.ResourceManager", {
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String?} database filename, default is "resource-db.json"
   */
  construct : function(dbFilename) {
    this.base(arguments);
    this.__dbFilename = dbFilename || "resource-db.json";
    this.__libraries = [];
  },

  members : {
    __dbFilename : null,
    __db : null,
    __libraries : null,

    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary : function(library) {
      this.__libraries.push(library);
    },

    /**
     * Loads the cached database
     *
     * @param callback
     */
    loadDatabase : function(callback) {
      var t = this;
      async.waterfall([
        function readDb(callback) {
          fs.exists(t.__dbFilename, function(exists) {
            if (exists)
              fs.readFile(t.__dbFilename, { encoding: "utf-8" }, callback);
            else
              callback(null, null);
          });
        },

        function parseDb(data, callback) {
          t.__db = data && data.trim().length ? JSON.parse(data) : {};
          callback(null, t.__db);
        }
        ], callback);
    },

    /**
     * Saves the database
     *
     * @param callback
     */
    saveDatabase : function(callback) {
      log.debug("saving resource manager database");
      fs.writeFile(this.__dbFilename, JSON.stringify(this.__db, null, 2), callback);
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase : function() {
      return this.__db;
    },

    /**
     * Scans all libraries looking for resources; this does not analyse the
     * files, simply compiles the list
     *
     * @param callback
     */
    findAllResources : function(callback) {
      var t = this;
      var db = this.__db;
      if (!db.resources)
        db.resources = {};

      // Scan all teh libraries
      async.forEach(t.__libraries,
        function(library, callback) {
          var resources = db.resources[library.libraryName];
          if (!resources)
            db.resources[library.libraryName] = resources = {};
          var rootDir = path.join(library.rootDir, library.resourcePath);
          var tasks = [];

          // Scans a folder, recursively, looking for resource files
          function scanDir(dir, callback) {

            // Get the list of files
            fs.readdir(dir, function(err, files) {
              if (err)
                return callback(err);

              // and process each one
              async.forEach(files,
                function(file, callback) {
                  var absFile = path.join(dir, file);
                  fs.stat(absFile, function(err, stat) {
                    if (err)
                      return callback(err);

                    // Directory? recurse
                    if (stat.isDirectory()) {
                      scanDir(absFile, callback);
                    } else {
                      var relFile = absFile.substring(rootDir.length + 1);
                      var fileInfo = resources[relFile];
                      if (!fileInfo)
                        fileInfo = resources[relFile] = {};

                      // Meta files need to be processed if they've changed
                      if (absFile.match(/\.meta$/)) {
                        fs.stat(absFile, function(err, stat) {
                          if (err)
                            return callback(err);
                          var mtime = null;
                          try {
                            mtime = fileInfo.mtime && new Date(fileInfo.mtime);
                          } catch (e) {
                          }

                          // Out of date?  then process it later
                          if (!mtime || mtime.getTime() != stat.mtime.getTime()) {
                            tasks.push(fileInfo);
                            fileInfo.absFile = absFile;
                            fileInfo.mtime = stat.mtime;
                          }
                        });

                      }
                      callback();
                    }
                  });
                },
                callback);
            });
          }

          // If the root folder exists, scan it
          fs.exists(rootDir, function(exists) {
            if (!exists)
              return callback(null);

            // Scan it, and when the entire tree is loaded inspect those files that
            //  need separate processing (eg meta files)
            scanDir(rootDir, function (err) {
              if (err)
                return callback(err);

              if (tasks.length == 0)
                return callback(null);

              // inspect all the files that need it
              var identifyQueue = async.queue(function(fileInfo, callback) {
                fs.readFile(fileInfo.absFile, { encoding: "utf-8" }, function(err, data) {
                  if (err)
                    return callback(err);
                  delete fileInfo.absFile;
                  fileInfo.meta = JSON.parse(data);
                  return callback(null);
                });
              }, 20);

              identifyQueue.push(tasks);
              identifyQueue.drain = function(err) {
                callback(err);
              };
            });
          });

        },
        callback);
    },

    /**
     * Collects information aboust the assets listed in srcPaths;
     * @param srcPaths
     * @param callback
     */
    getAssets: function(srcPaths, callback) {
      var t = this;
      var db = this.__db;

      // Generate a lookup that maps the resource name to the meta file that
      //  contains the composite
      var metas = {};
      for (var libraryName in db.resources) {
        var libraryData = db.resources[libraryName];
        for (var resourcePath in libraryData) {
          var fileInfo = libraryData[resourcePath];
          if (!fileInfo.meta)
            continue;
          for (var altPath in fileInfo.meta) {
            metas[altPath] = resourcePath;
          }
        }
      }

      // Collect a list of assets
      var assets = [];
      var assetPaths = {};

      function addAsset(libraryName, resourceName) {
        if (assetPaths[resourceName])
          return;

        var libraryData = db.resources[libraryName];
        var fileInfo = libraryData[resourceName];
        var asset = {
          libraryName: libraryName,
          filename: resourceName,
          fileInfo: fileInfo
        };

        // Does this have meta data for a composite?
        var metaPath = metas[resourceName];
        if (metaPath != null) {
          var metaInfo = libraryData[metaPath];
          if (metaInfo) {
            // Extract the fragment from the meta data for this particular resource
            var resMetaData = metaInfo.meta[resourceName];
            fileInfo.composite = resMetaData[3];
            fileInfo.x = resMetaData[4];
            fileInfo.y = resMetaData[5];
            if (!assetPaths[metaPath])
              srcPaths.push(metaPath);
          }
        }
        assets.push(asset);
        assetPaths[resourceName] = true;
      }

      for (var i = 0; i < srcPaths.length; i++) {
        var srcPath = srcPaths[i];
        var libraryName = srcPath.match(/^(\w+)/)[0];
        var libraryData = db.resources[libraryName];
        var pos = srcPath.indexOf('*');
        if (pos > -1) {
          srcPath = srcPath.substring(0, pos);
          for (var resourceName in libraryData) {
            if (resourceName.substring(0, srcPath.length) == srcPath)
              addAsset(libraryName, resourceName);
          }
        } else {
          var fileInfo = libraryData[srcPath];
          if (fileInfo)
            addAsset(libraryName, srcPath);
        }
      }
      if (assets.length == 0) {
        callback(null, []);
        return;
      }

      function findLibrary(name) {
        for (var i = 0; i < t.__libraries.length; i++)
          if (t.__libraries[i].libraryName == name)
            return t.__libraries[i];
        return null;
      }

      // For each asset, see if we need to update
      var tasks = [];
      async.forEach(assets,
        function(asset, callback) {
          var fileInfo = asset.fileInfo;
          var library = findLibrary(asset.libraryName);
          var filename = path.join(library.rootDir, library.resourcePath, asset.filename);

          fs.stat(filename, function(err, stat) {
            if (err)
              return callback(err);

            var mtime = null;
            try {
              mtime = fileInfo.mtime && new Date(fileInfo.mtime);
            } catch (e) {
            }
            if (fileInfo.width === undefined || fileInfo.height === undefined || !mtime || mtime.getTime() != stat.mtime.getTime()) {
              if (/(png|gif|jpg|jpeg)$/.test(filename))
                tasks.push(asset);
              fileInfo.mtime = stat.mtime;
            }
            callback();
          });
        },
        function(err, results) {
          if (err)
            return callback(err);

          if (tasks.length == 0)
            return callback(err, assets);

          // inspect all the files that need it
          var count = 0;
          var identifyQueue = async.queue(function(asset, callback) {
            var library = findLibrary(asset.libraryName);
            var filename = path.join(library.rootDir, library.resourcePath, asset.filename);

            if (filename.match(/meta$/)) {
              fs.readFile(filename, { encoding: "utf-8" }, function(err, data) {
                if (err)
                  return callback(err);
                asset.fileInfo.meta = JSON.parse(data);
              });
            } else {
              log.trace('identify -format "%G" ' + filename);
              child_process.exec('identify -format "%G" ' + filename, function(err, stdout) {
                if (err)
                  return callback(err);
                var match = stdout.match(/([0-9]+)x([0-9]+)/);
                if (match) {
                  asset.fileInfo.width = parseInt(match[1], 10);
                  asset.fileInfo.height = parseInt(match[2], 10);
                }
                if (++count % 25 == 0)
                  log.trace("..." + count + " leaving " + identifyQueue.length());
                return callback();
              });
            }
          }, 20);

          identifyQueue.push(tasks);
          identifyQueue.drain = function(err) {
            log.trace("updateImageData - drained queue");
            callback(err, assets);
          };
        });
    }
  }
});

for ( var name in qxanalyser)
  exports[name] = qxanalyser[name];
