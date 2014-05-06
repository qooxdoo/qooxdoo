Updating Sizzle.js
******************

1.  Download an archive of the latest release from `GitHub <https://github.com/jquery/sizzle/releases>`__ and note the commit hash
2.  Replace the MIT license text in qx.bom.Selector with the updated version from the archive (MIT-LICENSE.txt)
3.  Replace the Sizzle version number and commit hash in the class comment of qx.bom.Selector
4.  Replace the contents of qx.bom.Selector below the comment "Below is the original Sizzle code" with the contents of sizzle/<version>/dist/sizzle.js
5.  Replace the Sizzle code at the end of the file between the "// EXPOSE" comments with the qooxdoo version:

::

    // EXPOSE qooxdoo variant
    qx.bom.Selector.query = function(selector, context) {
      return Sizzle(selector, context);
    };

    qx.bom.Selector.matches = function(selector, set) {
      return Sizzle(selector, null, null, set);
    };
    // EXPOSE qooxdoo variant