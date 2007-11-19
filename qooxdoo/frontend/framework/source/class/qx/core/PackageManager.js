qx.Class.define("qx.core.PackageManager",
{
  statics :
  {
    _loading : false,
    _loadedParts : {},
    _loadedPackages : {},

    _queue : [],
    _queuedParts : {},

    loadPart : function(name, callback)
    {
      if (this._loadedParts[name])
      {
        callback();
        return;
      }

      if (this._queuedParts[name]) {
        return;
      }

      console.debug("Queue part: " + name);

      this._queue.push({
        name : name,
        callback : callback
      });

      this.flushParts();
    },

    flushParts : function()
    {
      var queue = this._queue;

      if (queue.length === 0) {
        return;
      }

      var part = queue[0];
      var name = part.name;

      // Load next package in list
      var packages = this._parts[name];
      console.debug("Loading packages: " + packages);
      for (var i=0, l=packages.length; i<l; i++)
      {
        if (!this._loadedPackages[packages[i]])
        {
          this.loadPackage(packages[0]);

          return;
        }
      }

      this._loadedParts[name] = true;
      part.callback();
    },

    loadPackage : function(id)
    {
      console.debug("Load package: " + id);



      this.flushParts();
    },

    loadFile : function()
    {

    }
  },





  defer : function(statics)
  {
    statics._parts = qxpackages.parts;
    statics._variant = qxpackages.variant;

    // window.qxpackages = undefined;
  }
});
