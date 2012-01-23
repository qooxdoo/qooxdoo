API Viewer
**********

.. image:: apiviewer.png
           :target: http://demo.qooxdoo.org/%{version}/apiviewer

The API Viewer displays class API reference for one or more libraries. The tree view pane offers the typical class hierarchy, organized by name spaces. Each package (intermediate name space) has an overview description and links to the sub-packages or classes it contains. Descriptions usually contain cross links to relevant packages or classes. The entire reference is searchable through the search tab, where you can enter class and method names.

The actual API descriptions are generated from :doc:`JSDoc-style comments </pages/development/write_api_documentation>` in the class code, and can be generated for custom applications as well, so you can browse the API of your own classes in Apiviewer.

Linking Source Files
--------------------

The header for each class, interface or mixin displayed in the API Viewer can optionally display a link to the source code, typically provided by the web interface of a source code management system.
To add these links for your own libraries, define the key ``info/sourceViewUri`` in ``Manifest.json``, e.g.:

::

  "info" : 
  {
    "name" : "Custom Application",
    "version" : "trunk",
    "qooxdoo-versions": ["trunk"],
    //[...]
    "sourceViewUri" : "https://github.com/someuser/custom/blob/master/source/class/%{classFilePath}"
  },

``%{classFilePath}`` is a placeholder that will be replaced with the fully qualified name of the class converted to a file path, e.g. ``custom.model.OrderData`` would become ``custom/model/OrderData.js``.