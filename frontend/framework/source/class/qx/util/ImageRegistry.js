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

/**
 * The image registry contains information about image sizes and information about
 * clipped images. The {@link qx.ui.basic.Image} class uses this information to
 * render images.
 */
qx.Class.define("qx.util.ImageRegistry",
{
  extend : qx.core.Object,
  type : "singleton",


  construct : function ()
  {
    this.base(arguments);

    // {Map} the shared image registry
    this.__registry = window.qxresourceinfo || {};
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Register information about an image.
     *
     * @param iconUri {String} The URI of the image to register information about.
     * @param mappedUri {String} The image URI, which should be used to display
     *     the image. This can be either the same as the image URI or the URI
     *     of a combined image containing several images.
     * @param xOffset {Integer} The horizontal start offset of the image.
     * @param yOffset {Integer} The vertical start offset of the image.
     * @param width {Integer} The image width
     * @param height {Integer} The image height
     */
    register : function(iconUri, mappedUri, xOffset, yOffset, width, height)
    {
      // Protect overwriting
      if (this.__registry[iconUri]) {
        return;
      }
      
      //this.debug("Register not yet supported: " + iconUri);
      return;

      var isPng = qx.lang.String.endsWith(iconUri, ".png");

      // Use clipped images unless the image is PNG and the browser IE6
      var Engine = qx.bom.client.Engine;
      if (isPng && Engine.MSHTML && Engine.VERSION < 7)
      {
        this.__registry[iconUri] = [width, height, "type", "lib"];
      }
      else
      {
        if (iconUri == mappedUri)
        {
          this.__registry[iconUri] = [width, height, "type", "lib"];
        }
        else
        {
          this.__registry[iconUri] = [width, height, "type", "lib", mappedUri, xOffset, yOffset, "mtype", "mlib"];
        }
      }
    },


    /**
     * Whether the registry has informations about the given resource.
     *
     * @type member
     * @param uri {String} The resource to get the information for
     * @return {Boolean} <code>true</code> when the resource is known.
     */
    has : function(uri) {
      return !!this.__registry[uri];
    },


    /**
     * Get information about an resource.
     *
     * @param uri {String} The resource to get the information for
     * @return {Array} Registered data
     */
    get : function(uri) {
      return this.__registry[uri] || null;
    },
    
    
    // only used in grid decoration currently
    getClipped : function(id)
    {
      var entry = this.__registry[id];
      if (!entry) {
        return null;
      }
      
      var width = entry[0];
      var height = entry[1];      
      
      if (entry.length > 4) 
      {
        var uri = entry[4];
        var left = entry[5];
        var top = entry[6];        
      }
      else
      {
        var uri = id;
        var left = 0;
        var top = 0;
      }
      
      return [uri, left, top, width, height];
    },
    
    
    toUri : function(id)
    {
      if (id == null) {
        return null;
      }
      
      var entry = this.__registry[id];

      if (!entry) 
      {
        this.debug("Oops: Missing image: " + id);
        return id;
      }
      
      if (typeof entry === "string") {
        var lib = entry
      } else {
        var lib = entry[3];
      }
      
      return window.qxlibinfo[lib].resuri + "/" + id;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__registry");
  }
});
