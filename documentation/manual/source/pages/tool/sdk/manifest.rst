.. _pages/application_structure/manifest#manifest.json:

Manifest.json
*************

%{qooxdoo}'s `Manifest files <http://en.wikipedia.org/wiki/Manifest_file>`_ serve to provide meta information for a library in a structured way. Their syntax is in JSON. They have a more informational part (keyed ``info``), which is more interesting for human readers and a technical part (named ``provides``) that is used in the processing of generator configurations. 

Beginning with the new Node.js compiler tool chain, there is also a part named ``externalResources`` to include CSS and Javascript files. This is not available when using the python generator!

Here is a brief sample with all the possible keys:

Manifest files are referenced in application's `config.json` files (in the :ref:`pages/tool/generator/generator_config_ref#library` key), to identify the library they stand for.

Reference
=========

This is a sample file:

::

    {
      "info" : 
      {
        "name" : "Custom Application",

        "summary" : "Custom Application",
        "description" : "This is a skeleton for a custom application with qooxdoo.",

        "keywords" : ["custom"],
        "homepage" : "http://some.homepage.url/",

        "license" : "SomeLicense",
        "authors" : 
        [
          {
            "name" : "First Author (uid)",
            "email" : "first.author@some.domain"
          }
        ],

        "version" : "trunk",
        "qooxdoo-versions": ["trunk"],
        "sourceViewUri" : "https://github.com/someuser/custom/blob/master/source/class/%{classFilePath}#L%{lineNumber}"
      },

      "provides" : 
      {
        "namespace"   : "custom",
        "encoding"    : "utf-8",
        "class"       : "source/class",
        "resource"    : "source/resource",
        "translation" : "source/translation",
        "type"        : "application"
      },

      "externalResources" :
      {
        "script": [
          "js/customscript.js",
        ],
        "css": [
          "styles/style.css"
        ]
      }
    }

Description of Keys:
--------------------

* **info**: All entries in this section are optional.

  * **name**: Name of the library.
  * **summary**: Short summary of its purpose.
  * **description**: Descriptive text.
  * **keywords**: List of keywords, tags.
  * **homepage**: Homepage URL of the library.
  * **license**: License name(s) of the library.
  * **authors**: Author(s) of the library. A list of maps, each map containing the following fields:

    * **name** : Author name.
    * **email** : Author email address.

  * **version**: Version of  the library.
  * **qooxdoo-versions**: List of versions of the %{qooxdoo} framework this library is compatible with.
  * **sourceViewUri**: URL to view the library's class code online. This URL will be used in generated API documentation. It has a special syntax and allows for placeholders (e.g. for the class name and the source line number). See the :ref:`Apiviewer documentation <pages/application/apiviewer#linking>` for details.

* **provides**: Entries in this section are mandatory.
  
  * **namespace**: Library namespace (i.e. the namespace elements all class names in this library are prefixed with, e.g. ``foo`` for a main application class with name ``foo.Application``).
  * **encoding**: File encoding of source code files (should be utf-8).
  * **class**: Path to the library's class code relative to the Manifest.json file, up to but not including the root namespace folder (e.g. ``source/class``).
  * **resource**: Path to the library's resources relative to the Manifest.json file, up to but not including the root namespace folder (e.g. ``source/resource``).
  * **translation**: Path to the library's translation files relative to the Manifest.json file (e.g. ``source/translation``).
  * **type**: One of [``library``, ``application``].

* **externalResources**: Static Javascript and CSS files that shall be always included without further processing by qooxdoo. All paths are relative to the resource folder stated in the "provides" section. Only available in the Node.js-based qooxdoo compiler.

  * **script**: Array of javascript files.
  * **css**: Array of css files.

