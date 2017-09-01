/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");
var jsonlint = require("jsonlint");

var log = util.createLog("makers");

/**
 * Maker for the Demo Browser
 */
module.exports = qx.Class.define("qxcompiler.makers.DemoBrowserMaker", {
  extend: require("./Maker"),

  construct: function(qooxdooPath) {
    this.base(arguments);
    this.__qooxdooPath = qooxdooPath;
  },

  members: {
    __qooxdooPath: null,
    __initialised: false,
    __demodata: null,

    _initialise: function(cb) {
      var t = this;
      if (this.__initialised)
        return cb();

      function addLibrary(namespace, rootDir, cb) {
        var lib = new qxcompiler.Library();
        lib.loadManifest(rootDir, function(err) {
          if (!err)
            t.getAnalyser().addLibrary(lib);
          return cb && cb(err);
        });
      }

      async.series([
          function(cb) {
            t.getTarget().open(cb);
          },

          function(cb) {
            addLibrary("demobrowser", t.__qooxdooPath + "/application/demobrowser", cb);
          },

          function(cb) {
            addLibrary("qx", t.__qooxdooPath + "/framework", cb);
          },

          function(cb) {
            addLibrary("qxc.ui.logpane", t.__qooxdooPath + "/component/library/logpane", cb);
          },

          function(cb) {
            addLibrary("qxc.ui.versionlabel", t.__qooxdooPath + "/component/library/versionlabel", cb);
          }
        ],
        function(err) {
          t.__initialised = true;
          cb(err);
        });

    },

    /*
     * @Override
     */
    make: function(cb) {
      this.checkCompileVersion()
        .then(() => this.writeCompileVersion())
        .then(() => {
          var t = this;
          var analyser = this.getAnalyser();
          var target = this.getTarget();
          var environment = {
            "qx.allowUrlVariants" : true,
            "qx.allowUrlSettings" : true,
            "qx.contrib": false,
            "qx.icontheme": ["Tango", "Oxygen"]
          };
          analyser.setEnvironmentCheck(environment);
    
          var appInfos = [];
    
          return new Promise((resolve, reject) => {
            async.series([
              function(cb) {
                t.__demodata = null;
                t._initialise(cb);
              },
    
              /*
               * Run the code generator for demo browser
               */
              function(cb) {
                // own packages; this needs to be absolute so that it is relative to the PWD
                // and not this module
                var DataGenerator = require(path.resolve(path.normalize(t.__qooxdooPath + "/application/demobrowser/tool/lib/DataGenerator")));
    
                // global vars
                var config = {
                  demoPath: path.normalize(t.__qooxdooPath + "/application/demobrowser/source/demo/"),
                  demoDataJsonFile: path.normalize(t.__qooxdooPath + "/application/demobrowser/source/script/demodata.json"),
                  classPath: path.normalize(t.__qooxdooPath + "/application/demobrowser/source/class"),
                  jsSourcePath: path.normalize(t.__qooxdooPath + "/application/demobrowser/source/class/demobrowser/demo"),
                  demoConfigJsonFile: path.normalize("config.demo.json"),
                  verbose: false
                };
    
                // main
                var dataGenerator = new DataGenerator(config);
                async.series([
    
                  // catches all the demos from config.demoPath
                  dataGenerator.catchEntries.bind(dataGenerator),
    
                  // Creates json file with all demos
                  dataGenerator.createJsonDataFile.bind(dataGenerator),
    
                  // Create config.demo.json file with all the jobs
                  dataGenerator.createJsonConfigFile.bind(dataGenerator),
    
                  // copy all javascript files to config.scriptDestinationPath
                  dataGenerator.copyJsFiles.bind(dataGenerator)
                ], cb);
              },
    
              /*
               * Read the demodata configuration
               */
              function(cb) {
                fs.readFile(t.__qooxdooPath + "/application/demobrowser/source/script/demodata.json", {encoding: "utf8"}, function(err, data) {
                  if (err)
                    return cb(err);
                  t.__demodata = jsonlint.parse(data);
                  cb();
                });
              },
    
              /*
               * Start
               */
              function(cb) {
                analyser.open(cb);
              },
    
              /*
               * Get the list of applications and analyse the required classes
               */
              function(cb) {
                // One for each of the demo classes
                DEMO_APP_CLASSES.forEach(function(name) {
                  appInfos.push({
                    app: new qxcompiler.app.Application(name, [
                      "qx.theme.Indigo",
                      "qx.theme.Simple",
                      "qx.theme.Modern",
                      "qx.theme.Classic",
                      "qx.log.appender.Native",
                      "qx.log.appender.Console",
                      "qx.dev.ObjectSummary"
                    ]).set({
                      theme: "qx.theme.Indigo",
                      analyser: analyser,
                      environment: environment
                    }),
                    demoApp: true,
                    className: name
                  });
                });
    
                // And one for the main demo browser app
                appInfos.push({
                  app: new qxcompiler.app.Application("demobrowser.Application", [
                      "demobrowser.Theme",
                      "qx.theme.Indigo",
                      "qx.theme.Simple",
                      "qx.theme.Modern",
                      "qx.theme.Classic",
                      "qx.log.appender.Native",
                      "qx.log.appender.Console",
                      "qx.dev.ObjectSummary"
                    ]).set({
                      theme: "demobrowser.Theme",
                      analyser: analyser,
                      environment: environment
                    }),
                  demoApp: false,
                  className: "demobrowser.Application"
                });
    
                analyser.analyseClasses(cb);
              },
    
              /*
               * Generate the applications
               */
              function(cb) {
                log.info("Writing targets");
                async.eachSeries(appInfos,
                  function(appInfo, cb) {
                    var app = appInfo.app;
    
                    // Configure the target
                    if (appInfo.demoApp) {
                      target.set({
                        generateIndexHtml: false,
                        scriptPrefix: appInfo.className + "-",
                        targetUri: "../.."
                      });
                    } else {
                      target.set({
                        generateIndexHtml: true,
                        scriptPrefix: "",
                        targetUri: ""
                      });
                    }
    
                    // Calculate dependencies and write it out
                    app.setAnalyser(analyser);
                    app.calcDependencies();
                    //log.info("Writing target " + target + " for " + app.getClassName());
                    target.setAnalyser(analyser);
                    target.generateApplication(app, null, function(err) {
                      if (err)
                        return cb(err);
                      cb();
                    });
                  },
                  cb);
              },
    
              /*
               * Save
               */
              function(cb) {
                analyser.saveDatabase(cb);
              },
    
              /*
               * Finally sync extra files into the build directory
               */
              function(cb) {
                log.info("Syncing files...");
                async.parallel([
                  /*
                   * Files generated above
                   */
                  function(cb) {
                    qxcompiler.files.Utils.sync(t.__qooxdooPath + "/application/demobrowser/source/demo",
                        target.getOutputDir() + "/demo")
                        .then(() => cb()).catch((err) => cb(err));
                  },
    
                  /*
                   * Resources
                   */
                  function(cb) {
                    qxcompiler.files.Utils.sync(t.__qooxdooPath + "/application/demobrowser/source/resource",
                        target.getOutputDir() + "/resource")
                        .then(() => cb()).catch((err) => cb(err));
                  },
    
                  /*
                   * Copy the source so that it can be shown in the demo browser
                   */
                  function(cb) {
                    async.each(DEMO_APP_CLASSES, function(name, cb) {
                      var filename = analyser.getClassFilename(name);
                      qxcompiler.files.Utils.sync(filename, target.getOutputDir() + "/script/" + name + ".src.js")
                        .then(() => cb()).catch((err) => cb(err));
                    }, cb);
                  },
    
                  /*
                   * Copy demodata.json over too
                   */
                  function(cb) {
                    qxcompiler.files.Utils.sync(
                        t.__qooxdooPath + "/application/demobrowser/source/script/demodata.json",
                        target.getOutputDir() + "/script/demodata.json")
                        .then(() => cb()).catch((err) => cb(err));
                  }
                ], cb);
              },
    
              /*
               * Our generated filenames are not quite the same as the stock generate.py, but this file
               * depends on exact filenames so we replace it with a patched version
               */
              function(cb) {
                log.info("Patching demobrowser...");
                fs.readFile("demobrowser-helper.js", { encoding: "utf-8" }, function(err, data) {
                  if (err)
                    return cb(err);
                  fs.writeFile(target.getOutputDir() + "/demo/helper.js", data, { encoding: "utf8" }, function(err) {
                    return cb(err);
                  });
                });
              }
    
              ], 
              (err) => err ? reject(err) : resolve());
          });
        })
        .then(() => cb())
        .catch(cb);
    }
  }
});


var DEMO_APP_CLASSES = [
  "demobrowser.demo.animation.Animation",
  "demobrowser.demo.animation.Animation_3d",
  "demobrowser.demo.animation.Animation_Compare",
  "demobrowser.demo.animation.Scroll",
  "demobrowser.demo.animation.Timing",
  "demobrowser.demo.bom.AttributeStyle_1",
  "demobrowser.demo.bom.AttributeStyle_2",
  "demobrowser.demo.bom.Audio",
  "demobrowser.demo.bom.Background",
  "demobrowser.demo.bom.Blocker",
  "demobrowser.demo.bom.Carousel",
  "demobrowser.demo.bom.Clip",
  "demobrowser.demo.bom.Cookie",
  "demobrowser.demo.bom.Dimension",
  "demobrowser.demo.bom.Environment",
  "demobrowser.demo.bom.Flash",
  "demobrowser.demo.bom.Geolocation",
  "demobrowser.demo.bom.Iframe",
  "demobrowser.demo.bom.Input",
  "demobrowser.demo.bom.Label",
  "demobrowser.demo.bom.Location",
  "demobrowser.demo.bom.Location_StandardMode",
  "demobrowser.demo.bom.PageVisibility",
  "demobrowser.demo.bom.Placeholder",
  "demobrowser.demo.bom.ScrollIntoView",
  "demobrowser.demo.bom.Selection",
  "demobrowser.demo.bom.Selector",
  "demobrowser.demo.bom.Storage",
  "demobrowser.demo.bom.Transform",
  "demobrowser.demo.bom.Video",
  "demobrowser.demo.bom.Viewport",
  "demobrowser.demo.bom.Viewport_StandardMode",
  "demobrowser.demo.bom.WebWorker",
  "demobrowser.demo.bom.Window",
  "demobrowser.demo.event.ElementResize",
  "demobrowser.demo.event.Event",
  "demobrowser.demo.event.Event_Bubbling",
  "demobrowser.demo.event.Event_Bus",
  "demobrowser.demo.event.Event_Iframe",
  "demobrowser.demo.event.Focus",
  "demobrowser.demo.event.KeyEvent",
  "demobrowser.demo.event.KeyEvent_LowLevel",
  "demobrowser.demo.event.MouseEvent",
  "demobrowser.demo.event.MouseEvent_LowLevel",
  "demobrowser.demo.event.PointerEvent",
  "demobrowser.demo.data.ExtendedList",
  "demobrowser.demo.data.ExtendedTree",
  "demobrowser.demo.data.Finder",
  "demobrowser.demo.data.Flickr",
  "demobrowser.demo.data.Form",
  "demobrowser.demo.data.FormAndListController",
  "demobrowser.demo.data.FormController",
  "demobrowser.demo.data.Github",
  "demobrowser.demo.data.JsonToList",
  "demobrowser.demo.data.JsonToTree",
  "demobrowser.demo.data.ListController",
  "demobrowser.demo.data.ListControllerWith3Widgets",
  "demobrowser.demo.data.ListControllerWithFilter",
  "demobrowser.demo.data.ListControllerWithObjects",
  "demobrowser.demo.data.ModelDebugging",
  "demobrowser.demo.data.NamesList",
  "demobrowser.demo.data.Offline",
  "demobrowser.demo.data.OwnCodeInModel",
  "demobrowser.demo.data.SearchAsYouType",
  "demobrowser.demo.data.SelectBox",
  "demobrowser.demo.data.Service",
  "demobrowser.demo.data.SingleValueBinding",
  "demobrowser.demo.data.TreeController",
  "demobrowser.demo.data.Tree_Columns",
  "demobrowser.demo.mobile.Fingers",
  "demobrowser.demo.mobile.PingPong",
  "demobrowser.demo.layout.Basic",
  "demobrowser.demo.layout.Canvas_Fixed",
  "demobrowser.demo.layout.Canvas_LeftRight",
  "demobrowser.demo.layout.Canvas_MinMaxSizes",
  "demobrowser.demo.layout.Canvas_Percent",
  "demobrowser.demo.layout.Dock",
  "demobrowser.demo.layout.Dock_AutoSize",
  "demobrowser.demo.layout.Dock_FlexGrowing",
  "demobrowser.demo.layout.Dock_FlexShrinking",
  "demobrowser.demo.layout.Dock_Margin",
  "demobrowser.demo.layout.Dock_PercentSize",
  "demobrowser.demo.layout.Dock_Separator",
  "demobrowser.demo.layout.Flow",
  "demobrowser.demo.layout.Grid_Alignment",
  "demobrowser.demo.layout.Grid_Complex",
  "demobrowser.demo.layout.Grid_Simple",
  "demobrowser.demo.layout.HBox",
  "demobrowser.demo.layout.HBox_Flex",
  "demobrowser.demo.layout.HBox_Margin",
  "demobrowser.demo.layout.HBox_NegativeMargin",
  "demobrowser.demo.layout.HBox_Percent",
  "demobrowser.demo.layout.HBox_Reversed",
  "demobrowser.demo.layout.HBox_Separator",
  "demobrowser.demo.layout.HBox_ShrinkY",
  "demobrowser.demo.layout.HSplit",
  "demobrowser.demo.layout.ManualLayout",
  "demobrowser.demo.layout.Spacer_Grid",
  "demobrowser.demo.layout.Spacer_HBox",
  "demobrowser.demo.layout.VBox",
  "demobrowser.demo.layout.VBox_Flex",
  "demobrowser.demo.layout.VBox_Margin",
  "demobrowser.demo.layout.VBox_NegativeMargin",
  "demobrowser.demo.layout.VBox_Percent",
  "demobrowser.demo.layout.VBox_Reversed",
  "demobrowser.demo.layout.VBox_Separator",
  "demobrowser.demo.layout.VBox_ShrinkX",
  "demobrowser.demo.layout.VSplit",
  "demobrowser.demo.root.Application",
  "demobrowser.demo.root.Inline",
  "demobrowser.demo.root.Inline_Dynamic_Resize",
  "demobrowser.demo.root.Inline_Window",
  "demobrowser.demo.root.Page",
  "demobrowser.demo.showcase.Browser",
  "demobrowser.demo.showcase.Dialog",
  "demobrowser.demo.showcase.Form",
  "demobrowser.demo.showcase.Localization",
  "demobrowser.demo.showcase.Maps",
  "demobrowser.demo.showcase.Translation",
  "demobrowser.demo.table.Table",
  "demobrowser.demo.table.Table_Cell_Editor",
  "demobrowser.demo.table.Table_Conditional",
  "demobrowser.demo.table.Table_Context_Menu",
  "demobrowser.demo.table.Table_Drag_And_Drop",
  "demobrowser.demo.table.Table_Events",
  "demobrowser.demo.table.Table_Filtered_Model",
  "demobrowser.demo.table.Table_Huge",
  "demobrowser.demo.table.Table_Meta_Columns",
  "demobrowser.demo.table.Table_Remote_Model",
  "demobrowser.demo.table.Table_Resize_Columns",
  "demobrowser.demo.table.Table_Selection",
  "demobrowser.demo.table.Table_Window_Editor",
  "demobrowser.demo.treevirtual.TreeVirtual",
  "demobrowser.demo.treevirtual.TreeVirtual_Events",
  "demobrowser.demo.treevirtual.TreeVirtual_Filter",
  "demobrowser.demo.treevirtual.TreeVirtual_Multiple_Columns",
  "demobrowser.demo.treevirtual.TreeVirtual_Selections",
  "demobrowser.demo.ui.AutoSizeTextArea",
  "demobrowser.demo.ui.Command",
  "demobrowser.demo.ui.CommandGroupManager",
  "demobrowser.demo.ui.Cursor",
  "demobrowser.demo.ui.Decoration",
  "demobrowser.demo.ui.DragDrop",
  "demobrowser.demo.ui.FiniteStateMachine",
  "demobrowser.demo.ui.Font",
  "demobrowser.demo.ui.FormInvalids",
  "demobrowser.demo.ui.FormRenderer",
  "demobrowser.demo.ui.FormRendererCustom",
  "demobrowser.demo.ui.FormRendererDouble",
  "demobrowser.demo.ui.FormRendererPlaceholder",
  "demobrowser.demo.ui.FormValidator",
  "demobrowser.demo.ui.HeightForWidth",
  "demobrowser.demo.ui.Label_Reflow",
  "demobrowser.demo.ui.MultiPageForm",
  "demobrowser.demo.ui.NativeContextMenu",
  "demobrowser.demo.ui.Opacity",
  "demobrowser.demo.ui.Placement",
  "demobrowser.demo.ui.ScrollContainer",
  "demobrowser.demo.ui.WebFonts",
  "demobrowser.demo.virtual.CellEvents",
  "demobrowser.demo.virtual.CellSpan",
  "demobrowser.demo.virtual.Cells",
  "demobrowser.demo.virtual.ComboBox",
  "demobrowser.demo.virtual.Complex",
  "demobrowser.demo.virtual.ExtendedList",
  "demobrowser.demo.virtual.Gallery",
  "demobrowser.demo.virtual.GroupedList",
  "demobrowser.demo.virtual.List",
  "demobrowser.demo.virtual.ListWithFilter",
  "demobrowser.demo.virtual.Pane_Column",
  "demobrowser.demo.virtual.Pane_GridLines",
  "demobrowser.demo.virtual.Pane_Row",
  "demobrowser.demo.virtual.SelectBox",
  "demobrowser.demo.virtual.Selection",
  "demobrowser.demo.virtual.SettingsList",
  "demobrowser.demo.virtual.Table",
  "demobrowser.demo.virtual.Tree",
  "demobrowser.demo.virtual.Tree_Columns",
  "demobrowser.demo.virtual.Tree_Dynamic",
  "demobrowser.demo.widget.Atom",
  "demobrowser.demo.widget.Button",
  "demobrowser.demo.widget.Canvas",
  "demobrowser.demo.widget.CheckBox",
  "demobrowser.demo.widget.ColorPopup",
  "demobrowser.demo.widget.ColorSelector",
  "demobrowser.demo.widget.ComboBox",
  "demobrowser.demo.widget.DateChooser",
  "demobrowser.demo.widget.DateField",
  "demobrowser.demo.widget.Desktop",
  "demobrowser.demo.widget.Flash",
  "demobrowser.demo.widget.GroupBox",
  "demobrowser.demo.widget.HtmlEmbed",
  "demobrowser.demo.widget.Iframe",
  "demobrowser.demo.widget.Image",
  "demobrowser.demo.widget.Label",
  "demobrowser.demo.widget.List",
  "demobrowser.demo.widget.Menu",
  "demobrowser.demo.widget.MenuBar",
  "demobrowser.demo.widget.Popup",
  "demobrowser.demo.widget.ProgressBar",
  "demobrowser.demo.widget.RadioButton",
  "demobrowser.demo.widget.RadioButtonGroup",
  "demobrowser.demo.widget.Resizer",
  "demobrowser.demo.widget.ScrollBar",
  "demobrowser.demo.widget.SelectBox",
  "demobrowser.demo.widget.SlideBar",
  "demobrowser.demo.widget.Slider",
  "demobrowser.demo.widget.Spinner",
  "demobrowser.demo.widget.SplitPane",
  "demobrowser.demo.widget.StackContainer",
  "demobrowser.demo.widget.TabView",
  "demobrowser.demo.widget.TextField",
  "demobrowser.demo.widget.ToolBar",
  "demobrowser.demo.widget.Tooltip",
  "demobrowser.demo.widget.Tree",
  "demobrowser.demo.widget.Tree_Columns",
  "demobrowser.demo.widget.Window"
];
