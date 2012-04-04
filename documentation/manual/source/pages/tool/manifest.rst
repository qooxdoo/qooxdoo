.. _pages/application_structure/manifest#manifest.json:

Manifest.json
*************

`Manifest files <http://en.wikipedia.org/wiki/Manifest_file>`_ serve to provide meta information for a library in a structured way. Their syntax is in JSON. They have a more "informal" part (keyed ``info``), which is more interesting for human readers, and a technical part (named ``provides``) that is used in the processing of generator configurations. Here is a brief sample with all the possible keys:

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
        "qooxdoo-versions": ["trunk"]
      },

      "provides" : 
      {
        "namespace"   : "custom",
        "encoding"    : "utf-8",
        "class"       : "source/class",
        "resource"    : "source/resource",
        "translation" : "source/translation",
        "type"        : "application"
      }
    }

The file paths of the ``class``, ``resource`` and ``translation`` keys are taken to be relative to the directory of the Manifest file. To build applications, manifests are linked in the corresponding `config.json` (in the :ref:`pages/tool/generator_config_ref#library` key), to identify the library they describe.

