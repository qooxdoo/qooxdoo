qx.Bootstrap.define("qx.test.io.part.MockPackage",
{
  construct : function(id, delay, error, readyState, useClosure) 
  {
    this.id = id;
    this.delay = delay || 0;
    this.error = !!error;
    this.readyState = readyState || "initialized";
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
    }
  }
})