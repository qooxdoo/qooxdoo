/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Module for on demand class data loading.
 */
qx.Class.define("apiviewer.ClassLoader",
{
  extend : qx.core.Object,

  construct : function(baseUri)
  {
    this.base(arguments);

    this._baseUri = baseUri;
  },

  members :
  {
    load : function(className, async, callback, self)
    {
      var url = this._baseUri + "/" + className + ".js";
      var req = new qx.io.remote.Request(url);

      var cls = null;

      req.setAsynchronous(async);
      req.setTimeout(30000); // 30 sec
      req.setProhibitCaching(false);
      req.addEventListener("completed", function(evt)
      {
        var content = eval("(" + evt.getContent() + ")");

        var packageName = className.substring(0, className.lastIndexOf("."));
        var pkg = apiviewer.dao.Class.getClassByName(packageName);

        cls = new apiviewer.dao.Class(content, pkg);
        pkg.addClass(cls);

        this.__runCallback(cls, callback, self);
      }, this);

      req.addEventListener("failed", function(evt) {
        alert("Couldn't load file: " + url);
      }, this);

      req.send();

      return cls;
    },


    __runCallback : function(argument, callback, self)
    {
      if (callback) {
        if (self) {
          callback.call(self, argument);
        } else {
          callback(argument);
        }
      }
    },


    __loadClassList : function(classes, callback, self)
    {
      var classesToLoad = 0;
      var loadedClasses = 0;

      for (var i=0; i<classes.length; i++)
      {
        var clazz = classes[i];
        if (!clazz.isLoaded()) {
          this.load(clazz.getFullName(), true, function(cls)
          {
            loadedClasses += 1;
            if (loadedClasses >= classesToLoad) {
              this.__runCallback(apiviewer.dao.Class.getClassByName(classes[0].getFullName()), callback, self);
            }
          }, this);

          classesToLoad += 1;
        }
      }
      if (classesToLoad == 0) {
        this.__runCallback(classes[0], callback, self);
      }
    },



    classLoadDependendClasses : function(clazz, callback, self)
    {
      var dependendClasses = clazz.getDependendClasses();
      this.__loadClassList(dependendClasses, callback, self);
    },


    packageLoadDependendClasses : function(pkg, callback, self)
    {
      var classes = pkg.getClasses();
      this.__loadClassList(classes, callback, self);
    }

  }


});
