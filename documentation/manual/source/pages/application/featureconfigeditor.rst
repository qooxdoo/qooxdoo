.. _pages/application/featureconfigeditor#featureconfigeditor:

Feature Configuration Editor
****************************

.. image:: featureconfigeditor.png
           :target: http://demo.qooxdoo.org/%{version}/featureconfigeditor

A tool designed to help developers create configurations for browser-specific builds. Detected feature sets from multiple clients can be imported and compared to find common values. The selected features are displayed in JSON format and can be pasted straight into the application's ``config.json``.

Browser-specific builds
-----------------------

By predefining environment keys that correspond to certain browser-specific features, builds can be tailored towards certain clients. For example, legacy Internet Explorer versions (6,7 and 8) have very similar sets of features that are highly unlikely to change. Due to their comparatively poor JavaScript performance, they also particularly benefit from cutting down the size of the code that needs to be evaluated and the number of runtime feature checks, making them prime candidates for a custom build.

Generator configuration
^^^^^^^^^^^^^^^^^^^^^^^

Regardless of the usage scenario, developers need to make sure to carefully choose the environment settings to be hard-wired so as not to accidentally remove code needed by one of the target clients. The Feature Configration Editor was designed to facilitate this process by allowing developers to compare the feature sets of multiple browsers and create an environment configuration for common features.

The following job config example shows how to create an application variant customized for IE 6, 7 and 8.

**Please keep in mind that the environment map shown here is only an example and may be outdated. Make sure you always use environment values from the Feature Configuration Editor of the SDK you are using!**

::

    "build-script-legacyie" :
    {
      "extend" : ["build-script"],

      "environment" :
      {
        "browser.name":"ie",
        "css.animation": null,
        "css.animation.requestframe": null,
        "css.appearance": null,
        "css.borderimage": null,
        "css.borderimage.standardsyntax": null,
        "css.borderradius": null,
        "css.boxmodel": "content",
        "css.boxshadow": null,
        "css.float": "styleFloat",
        "css.gradient.filter": true,
        "css.gradient.legacywebkit": false,
        "css.gradient.linear": null,
        "css.gradient.radial": null,
        "css.inlineblock": "inline-block",
        "css.opacity": false,
        "css.overflowxy": true,
        "css.placeholder": false,
        "css.rgba": false,
        "css.textShadow": false,
        "css.textShadow.filter": true,
        "css.textoverflow": "textOverflow",
        "css.transform": null,
        "css.transform.3d": false,
        "css.usermodify": null,
        "css.userselect": null,
        "css.userselect.none": null,
        "ecmascript.array.every": false,
        "ecmascript.array.filter": false,
        "ecmascript.array.foreach": false,
        "ecmascript.array.indexof": false,
        "ecmascript.array.lastindexof": false,
        "ecmascript.array.map": false,
        "ecmascript.array.reduce": false,
        "ecmascript.array.reduceright": false,
        "ecmascript.array.some": false,
        "ecmascript.date.now": false,
        "ecmascript.error.stacktrace": null,
        "ecmascript.function.bind": false,
        "ecmascript.object.keys": false,
        "ecmascript.string.trim": false,
        "engine.name": "mshtml",
        "event.help": true,
        "event.pointer": false,
        "event.touch": false,
        "html.audio": false,
        "html.audio.aif": "",
        "html.audio.au": "",
        "html.audio.mp3": "",
        "html.audio.ogg": "",
        "html.audio.wav": "",
        "html.canvas": false,
        "html.classlist": false,
        "html.dataset": false,
        "html.element.compareDocumentPosition": false,
        "html.element.contains": true,
        "html.element.textcontent": false,
        "html.filereader": false,
        "html.geolocation": false,
        "html.image.naturaldimensions": false,
        "html.storage.userdata": true,
        "html.stylesheet.addimport": true,
        "html.stylesheet.createstylesheet": true,
        "html.stylesheet.deleterule": false,
        "html.stylesheet.insertrule": false,
        "html.stylesheet.removeimport": true,
        "html.svg": false,
        "html.video": false,
        "html.video.h264": "",
        "html.video.ogg": "",
        "html.video.webm": "",
        "html.vml": true,
        "html.webworker": false,
        "html.xpath": false,
        "html.xul": false,
        "io.ssl": false,
        "runtime.name": "ie",
        "xml.attributens": false,
        "xml.createelementns": false,
        "xml.createnode": true,
        "xml.domparser": false,
        "xml.domproperties": true,
        "xml.getelementsbytagnamens": false,
        "xml.getqualifieditem": true,
        "xml.implementation": false,
        "xml.selectnodes": true,
        "xml.selectsinglenode": true
      },

      "compile-options" :
      {
        "paths":
        {
          "file" : "build/script/${APPLICATION}_ie.js"
        }
      }
    }

By also running the default ``build-script`` job, an additional generic version of the application that makes no assumptions about client features can be generated whenever ``build`` is run:

::

    "build" :
    {
      "run" :
      [
        "build-resources",
        "build-script",
        "build-script-legacyie",
        "build-files"
      ]
    }

Loading a specific variant
^^^^^^^^^^^^^^^^^^^^^^^^^^

Finally, the application's ``index.html`` file must make sure the correct application variant is loaded based on the browser, e.g. by performing a simple user agent check:

.. code-block:: html

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>customapp</title>
      <script type="text/javascript">
        var suffix = "";

        if (/MSIE (6|7|8)\.0/.exec(navigator.userAgent)) {
          suffix = "_ie";
        }

        var scriptPath = "script/customapp" + suffix + ".js";
        document.write('<script type="text\/javascript" src="' + scriptPath + '"><\/script>');
      </script>
    </head>
    <body></body>
    </html>
