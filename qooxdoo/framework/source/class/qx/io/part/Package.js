/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The Package wraps a list of related script URLs, which are required by one
 * or more parts.
 *
 * @internal
 */
qx.Class.define("qx.io.part.Package",
{
  extend : qx.core.Object,


  /**
   * @param urls {String[]} A list of script URLs
   * @param id {var} Unique package hash key
   * @param loaded {Boolean?false} Whether the package is already loaded
   */
  construct : function(urls, id, loaded)
  {
    this.base(arguments);

    this.__readyState = loaded ? "complete" : "initialized";
    this.__urls = urls;
    this.__id   = id;
  },


  events :
  {
    /** This event is fired after the part has been loaded successfully. */
    "load" : "qx.event.type.Event",
    
    /**
     * The error event is fired if a package could not be loaded.
     */
    "error" : "qx.event.type.Event"
  },


  members :
  {
    __id : null,
    __urls : null,
    __readyState : null,

    
    /**
     * Loads a list of scripts in the correct order.
     *
     * @param urlList {String[]} List of script urls
     * @param callback {Function} Function to execute on completion
     * @param errBack {Function} Function to execute on error
     * @param self {Object?window} Context to execute the callback and errback in
     */    
    __loadScriptList : function(urlList, callback, errBack, self)
    {
      var responses = [];
      var loaders = [];
      var loadedFiles = 0;

      for (var i=0; i<urlList.length; i++)
      {
        var loader = loaders[i] = new qx.bom.Request();
        loader.open("GET", urlList[i], true);
        loader.send();
        
        loader.onload = qx.lang.Function.bind(function(i, loader)
        {        
          responses[i] = loader.responseText;          
          loader.dispose();
          loadedFiles += 1;
          if (loadedFiles == urlList.length)
          {
            this.__evalFiles(urlList, responses);
            callback.call(this);
          }          
        }, this, i, loader);
        
        var self = this;
        loader.onerror = loader.onabort = loader.ontimeout = function(loader) {
          self.__cleanupLoaders(loaders);
          errBack.call(self);
        }
      }
    },
    
    
    /**
     * Dispose all loaders
     * 
     * @param loaders {qx.bom.Request[]} list of loaders to dispose
     */
    __cleanupLoaders : function(loaders)
    {
      for (var i=0; i<loaders.length; i++)
      {
        var loader = loaders[i];
        loader.onerror = loader.onabort = loader.ontimeout = loader.onload = null;
        loader.dispose();
      }
    },
    
    
    /**
     * Eval the contents of a list of source files
     * 
     * @param names {String[]} file names
     * @param contentList {String[]} The content of the files.
     */
    __evalFiles : function(names, contentList)
    {
      for (var i=0; i<names.length; i++) 
      {
        // debugging assist for Firebug
        content = contentList[i] + "\r\n//@ sourceURL=" + names[i];
        eval(content);
      }
    },
    
    
    /**
     * Get the ready state of the package. The value is one of
     * <ul>
     * <li>
     *   <b>initialized</b>: The package is initialized. The {@link #load}
     *   method has not yet been called
     * </li>
     * <li><b>loading</b>: The package is still loading.</li>
     * <li><b>complete</b>: The package has been loaded successfully</li>
     * </li>
     *
     * @return {String} The ready state.
     */
    getReadyState : function() {
      return this.__readyState;
    },


    /**
     * Load the part's script URLs in the correct order. A {@link #load} event
     * if fired once all scripts are loaded.
     */
    load : function()
    {
      if (this.__readyState !== "initialized") {
        return;
      }

      this.__readyState = "loading";

      this.__loadScriptList(
        this.__urls,
        function() {
          this.__readyState = "complete";
          
          // TODO move this code one level up into the part loader
          var packageHash = qx.$$loader.packageHashes[this.__id];
          this._importPackageData(qx.$$packageData[packageHash]);
          this.fireEvent("load");
        },
        function() {
          this.__readyState = "error";
          this.fireEvent("error");
        },
        this
      );
    },

    /**
     * Import the data of a package. The function is defined in the loader
     * script.
     *
     * @signature function(packageData)
     * @param packageData {Map} Map of package data categories ("resources",...)
     */
    _importPackageData : qx.$$loader.importPackageData
  },

  
  destruct : function() {
    this.__urls = null;
  }
});
