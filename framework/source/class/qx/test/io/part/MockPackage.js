qx.Bootstrap.define("qx.test.io.part.MockPackage",
{
  construct : function(id, delay, error, readyState, useClosure)
  {
    this.id = id;
    this.delay = delay || 0;
    this.error = !!error;
    this.readyState = readyState || "initialized";
    this.useClosure = !!useClosure;
  },

  members :
  {
    getReadyState : function() {
      return this.readyState;
    },

    getId : function() {
      return this.id;
    },


    load : function(notifyPackageResult, self)
    {
      var pkg = this;

      this._loadWithClosure = false;

      pkg.readyState = "loading";
      setTimeout(function()
      {
        if (pkg.error)
        {
          pkg.readyState = "error";
        }
        else
        {
          if (pkg.useClosure)
          {

            qx.Part.$$notifyLoad(pkg.id, function() {
              qx.test.Part.LOAD_ORDER.push(pkg.id);
            });
          }
          else
          {
            qx.test.Part.LOAD_ORDER.push(pkg.id);
          }

          pkg.readyState = "complete";
        }

        notifyPackageResult.call(self, pkg);
      }, pkg.delay);
    },


    saveClosure : function(closure)
    {
      if (this.readyState == "error") {
        return;
      }

      if (!this._loadWithClosure) {
        this.execute();
      } else {
        this.__readyState = "cached";
        this.__notifyPackageResult(this);
      }
    },


    execute : function() {
      qx.test.Part.LOAD_ORDER.push(this.id);
    },


    loadClosure : function(notifyPackageResult, self)
    {
      var pkg = this;

      this._loadWithClosure = true;

      this.__notifyPackageResult = qx.Bootstrap.bind(notifyPackageResult, self);

      pkg.readyState = "loading";
      setTimeout(function()
      {
        if (pkg.error)
        {
          pkg.readyState = "error";
        }
        else
        {
          qx.Part.$$notifyLoad(pkg.id, function() {
            qx.test.Part.LOAD_ORDER.push(pkg.id);
          });

          pkg.readyState = "cached";
        }

        notifyPackageResult.call(self, pkg);
      }, pkg.delay);
    }
  }
})