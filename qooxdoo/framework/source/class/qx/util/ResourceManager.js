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
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} the shared image registry */
    __registry : qx.$$resources || {},

    /** {Map} prefix per library used in HTTPS mode for IE */
    __urlPrefix : {},

   /**
     * Whether the registry has information about the given resource.
     *
     * @deprecated Use '.getInstance().has' instead!
     * @param id {String} The resource to get the information for
     * @return {Boolean} <code>true</code> when the resource is known.
     */
    has : function(id) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().has' instead!"
      );
      return this.getInstance().has(id);
    },


    /**
     * Get information about an resource.
     *
     * @deprecated Use '.getInstance().getData' instead!
     * @param id {String} The resource to get the information for
     * @return {Array} Registered data or <code>null</code>
     */
    getData : function(id) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().getData' instead!"
      );
      return this.getInstance().getData(id);
    },


    /**
     * Returns the width of the given resource ID,
     * when it is not a known image <code>0</code> is
     * returned.
     *
     * @deprecated Use '.getInstance().getImageWidth' instead!
     * @param id {String} Resource identifier
     * @return {Integer} The image width, maybe <code>null</code> when the width is unknown
     */
    getImageWidth : function(id)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().getImageWidth' instead!"
      );
      return this.getInstance().getImageWidth(id);
    },


    /**
     * Returns the height of the given resource ID,
     * when it is not a known image <code>0</code> is
     * returned.
     *
     * @deprecated Use '.getInstance().getImageHeight' instead!
     * @param id {String} Resource identifier
     * @return {Integer} The image height, maybe <code>null</code> when the height is unknown
     */
    getImageHeight : function(id)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().getImageHeight' instead!"
      );
      return this.getInstance().getImageHeight(id);
    },


    /**
     * Returns the format of the given resource ID,
     * when it is not a known image <code>null</code>
     * is returned.
     *
     * @deprecated Use '.getInstance().getImageFormat' instead!
     * @param id {String} Resource identifier
     * @return {String} File format of the image
     */
    getImageFormat : function(id)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().getImageFormat' instead!"
      );
      return this.getInstance().getImageFormat(id);
    },


    /**
     * Whether the given resource identifier is a image
     * with clipping information available.
     *
     * @deprecated Use '.getInstance().isClippedImage' instead!
     * @param id {String} Resource identifier
     * @return {Boolean} Whether the resource ID is known as a clipped image
     */
    isClippedImage : function(id)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().isClippedImage' instead!"
      );
      return this.getInstance().isClippedImage(id);
    },


    /**
     * Converts the given resource ID to a full qualified URI
     *
     * @deprecated Use '.getInstance().toUri' instead!
     * @param id {String} Resource ID
     * @return {String} Resulting URI
     */
    toUri : function(id)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'getInstance().toUri' instead!"
      );
      return this.getInstance().toUri(id);
    }
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
      return entry && entry.length > 4;
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
          var resourceUri = qx.$$libraries[lib].resourceUri;

          // It is valid to to begin a URL with "//" so this case has to
          // be considered. If the to resolved URL begins with "//" the
          // manager prefixes it with "https:" to avoid any problems for IE
          if (resourceUri.match(/^\/\//) != null) {
            statics.__urlPrefix[lib] = window.location.protocol;
          }
          // If the resolved URL begins with "./" the final URL has to be
          // put together using the document.URL property.
          // IMPORTANT: this is only applicable for the source version
          else if (resourceUri.match(/^\.\//) != null && qx.core.Setting.get("qx.isSource"))
          {
            var url = document.URL;
            statics.__urlPrefix[lib] = url.substring(0, url.lastIndexOf("/"));
          } else if (resourceUri.match(/^http/) != null) {
            // Let absolute URLs pass through
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
