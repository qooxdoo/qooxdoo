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
qx.Bootstrap.define("qx.util.ResourceManager",
{
  statics :
  {
    /** {Map} the shared image registry */
    __registry : window.qxresourceinfo || {},
    
    
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
     * @param id {String} The resource to get the information for
     * @return {Boolean} <code>true</code> when the resource is known.
     */
    has : function(id) {
      return !!this.__registry[id];
    },


    /**
     * Get information about an resource.
     *
     * @param id {String} The resource to get the information for
     * @return {Array} Registered data
     */
    getData : function(id) {
      return this.__registry[id] || null;
    },
    
    
    // only used in grid decoration currently
    // internal structure:
    // images: [width, height, format, library, [clipped, left, top]]
    // other: library
    getClipped : function(id)
    {
      var entry = this.__registry[id];
      if (!entry) {
        return null;
      }
      
      var width = entry[0];
      var height = entry[1];      
      var format = entry[2];
      
      if (entry.length > 4) 
      {
        id = entry[4];
        
        var left = entry[5];
        var top = entry[6];        
      }
      else
      {
        var left = 0;
        var top = 0;
      }
      
      return [id, left, top, width, height, format];
    },
    
    
    toUri : function(id)
    {
      if (id == null) {
        return id;
      }
      
      var entry = this.__registry[id];
      if (!entry) {
        return id;
      }
      
      if (typeof entry === "string") {
        var lib = entry
      } else {
        var lib = entry[3];
      }
      
      return window.qxlibinfo[lib].resuri + "/" + id;
    }
  }
});
