(function() {
  var QOOXDOO_PATH = "../qooxdoo";

  function targets(path) {
    return [
      {
        "id": "source",
        "type": "SourceTarget",
        "outputTo": "../" + path + "/qxt/source-output"
      },
      {
        "id": "build",
        "type": "BuildTarget",
        "outputTo": "../" + path + "/qxt/build-output"
      },
      {
        "id": "source-hybrid",
        "type": "HybridTarget",
        "outputTo": "../" + path + "/qxt/hybrid-output"
      }
    ];
  }

  return {
    "database": "../shared-db.js",

    "applications": [
      {
        "id": "qxt",
        "class": "qxt.Application",
        "theme": "qxt.theme.Theme",
        "locales": ["en", "es"],
        "environment": {
          "qxt.customEnvironment": "this is custom (source target)"
        },
        "libraries": [
          "../testdata/qxt",
          QOOXDOO_PATH + "/framework",
          "../testdata/contrib/UploadMgr"
        ],
        "targets": targets("qxt")
      },
      {
        "id": "demobrowser",
        "maker": "DemoBrowserMaker",
        "qooxdoo": QOOXDOO_PATH,
        "targets": targets("demobrowser")
      }
    ]
  };
})();
