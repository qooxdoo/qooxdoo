
qx.Class.define("apiviewer.ClassLoader",
{
  extend : qx.core.Object,

  construct : function(baseUri)
  {
    this._baseUri = baseUri;
  },

  members :
  {
    load : function(className, async, callback, self)
    {
      var url = this._baseUri + "/" + className + ".js";
      this.debug("Loading " + url);

      var req = new qx.io.remote.Request(url);

      var cls = null;

      req.setAsynchronous(async);
      req.addEventListener("completed", function(evt)
      {
        var content = eval("(" + evt.getData().getContent() + ")");

        var packageName = className.substring(0, className.lastIndexOf("."));
        var pkg = apiviewer.dao.Class.getClassByName(packageName);

        cls = new apiviewer.dao.Class(content, pkg);

        this.__runCallback(cls, callback, self);
      }, this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
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