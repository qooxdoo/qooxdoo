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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Contains information about images (size, format, clipping, ...) and
 * other resources like CSS files, local data, ...
 */
qx.Class.define("qx.util.ResourceManager",
{
  extend  : qx.core.Object,
  type    : "singleton",

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * TODOC
   */
  construct : function()
  {
    this.base(arguments);

    // post-process any resources that are already registered
    this.postProcessPackageData();
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} the shared image registry */
    __registry : qx.$$resources || {},

    /** {Map} prefix per library used in HTTPS mode for IE */
    __urlPrefix : {},

    /** {Map} pre-loaded resources */
    __preloaded : {}
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Whether the registry has information about the given resource.
     *
     * @param id {String} The resource to get the information for
     * @return {Boolean} <code>true</code> when the resource is known.
     */
    has : function(id) {
      return !!this.self(arguments).__registry[id];
    },


    /**
     * Get information about an resource.
     *
     * @param id {String} The resource to get the information for
     * @return {Array} Registered data or <code>null</code>
     */
    getData : function(id) {
      return this.self(arguments).__registry[id] || null;
    },


    /**
     * Returns the width of the given resource ID,
     * when it is not a known image <code>0</code> is
     * returned.
     *
     * @param id {String} Resource identifier
     * @return {Integer} The image width, maybe <code>null</code> when the width is unknown
     */
    getImageWidth : function(id)
    {
      var entry = this.self(arguments).__registry[id];
      return entry ? entry[0] : null;
    },


    /**
     * Returns the height of the given resource ID,
     * when it is not a known image <code>0</code> is
     * returned.
     *
     * @param id {String} Resource identifier
     * @return {Integer} The image height, maybe <code>null</code> when the height is unknown
     */
    getImageHeight : function(id)
    {
      var entry = this.self(arguments).__registry[id];
      return entry ? entry[1] : null;
    },


    /**
     * Returns the format of the given resource ID,
     * when it is not a known image <code>null</code>
     * is returned.
     *
     * @param id {String} Resource identifier
     * @return {String} File format of the image
     */
    getImageFormat : function(id)
    {
      var entry = this.self(arguments).__registry[id];
      return entry ? entry[2] : null;
    },


    /**
     * Whether the given resource identifier is a image
     * with clipping information available.
     *
     * @param id {String} Resource identifier
     * @return {Boolean} Whether the resource ID is known as a clipped image
     */
    isClippedImage : function(id)
    {
      var entry = this.self(arguments).__registry[id];
      var isClipped = entry && entry.length > 4;
      if (isClipped){
        var combId  = entry[4];
        var combImg = this.self(arguments).__registry[combId];
        isClipped = combImg[2];  // return combined image type
        if (isClipped === "b64"){
          // make sure base64 combined images are preloaded
          // as the call needs to access its data immediately
          if (!this.self(arguments).__preloaded[combId]){
            isClipped = false;
          }
        }
      }
      return isClipped;
    },


    /**
     * Converts the given resource ID to a full qualified URI
     *
     * @param id {String} Resource ID
     * @return {String} Resulting URI
     */
    toUri : function(id)
    {
      if (id == null) {
        return id;
      }

      var entry = this.self(arguments).__registry[id];
      if (!entry) {
        return id;
      }

      if (typeof entry === "string") {
        var lib = entry;
      }
      else
      {
        var lib = entry[3];

        // no lib reference
        // may mean that the image has been registered dynamically
        if (!lib) {
          return id;
        }
      }

      var urlPrefix = "";
      if (qx.core.Variant.isSet("qx.client", "mshtml") &&
          qx.bom.client.Feature.SSL) {
        urlPrefix = this.self(arguments).__urlPrefix[lib];
      }

      return urlPrefix + qx.$$libraries[lib].resourceUri + "/" + id;
    },

    /**
     * TODOC
     */
    postProcessPackageData : function (dataMap) 
    {
      // Just go through the current __registry, pre-loading combined base64 images
      var registry = qx.util.ResourceManager.__registry;
      for (var resid in registry)
      {
        var resource = registry[resid];
        if (resource[2] == "b64")
        {
          var uri = qx.util.ResourceManager.getInstance().toUri(resid);
          var request = new qx.io.remote.Request(
            uri, "GET", "application/json");
          //TODO: The next might fail if resources are loaded from another server!
          request.setParseJson(true);

          var preloaded = qx.util.ResourceManager.__preloaded;
          var completedhandler = qx.lang.Function.curry(function(res,ev){
            var json = ev.getContent();
            preloaded[res] = json;
          }, resid);
          request.addListener("completed", completedhandler, this);

          request.addListener("changeState", function(ev){
            var state = ev.getData();
            if (state === "failed" || state === "aborted" || state === "timeout") {
              this.fireEvent("error");
            }
          }, this);

          request.send()
        }
      }
    },

    /**
     * TODOC
     */
    getPreloadedResource : function (resId) 
    {
      var entry = this.self(arguments).__preloaded[resId];
      if (!entry) {
        return resId;
      }
      return entry;
    }
  },


  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      // To avoid a "mixed content" warning in IE when the application is
      // delivered via HTTPS a prefix has to be added. This will transform the
      // relative URL to an absolute one in IE.
      // Though this warning is only displayed in conjunction with images which
      // are referenced as a CSS "background-image", every resource path is
      // changed when the application is served with HTTPS.
      if (qx.bom.client.Feature.SSL)
      {
        for (var lib in qx.$$libraries)
        {
          var resourceUri;
          if (qx.$$libraries[lib].resourceUri) {
            resourceUri = qx.$$libraries[lib].resourceUri;
          }
          else
          {
            // default for libraries without a resourceUri set
            statics.__urlPrefix[lib] = "";
            continue;
          }

          // It is valid to to begin a URL with "//" so this case has to
          // be considered. If the to resolved URL begins with "//" the
          // manager prefixes it with "https:" to avoid any problems for IE
          if (resourceUri.match(/^\/\//) != null) {
            statics.__urlPrefix[lib] = window.location.protocol;
          }
          // If the resourceUri begins with a single slash, include the current
          // hostname
          else if (resourceUri.match(/^\//) != null) {
            statics.__urlPrefix[lib] = window.location.protocol + "//" + window.location.host;
          }
          // If the resolved URL begins with "./" the final URL has to be
          // put together using the document.URL property.
          // IMPORTANT: this is only applicable for the source version
          else if (resourceUri.match(/^\.\//) != null)
          {
            var url = document.URL;
            statics.__urlPrefix[lib] = url.substring(0, url.lastIndexOf("/") + 1);
          } else if (resourceUri.match(/^http/) != null) {
            // Let absolute URLs pass through
            statics.__urlPrefix[lib] = "";
          }
          else
          {
            // check for parameters with URLs as value
            var index = window.location.href.indexOf("?");
            var href;
            if (index == -1) {
              href = window.location.href;
            } else {
              href = window.location.href.substring(0, index);
            }

            statics.__urlPrefix[lib] = href.substring(0, href.lastIndexOf("/") + 1);
          }
        }
      }
    }
  }
});
