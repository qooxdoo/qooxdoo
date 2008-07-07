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
    
    
    registerImage : function(uri, width, height)
    {
      // Protect overwriting
      if (this.__registry[uri]) {
        return;
      }
      
      qx.log.Logger.debug("Dynamically registering: " + uri);
      this.__registry[uri] = [width, height];
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
      
      // format non-clipped: width, height, type, lib
      if (entry.length < 5)
      {
        var left = 0;
        var top = 0;
      }
      
      // format clipped: width, height, type, lib, left, top
      else
      {
        id = entry[4];
        
        var left = entry[5];
        var top = entry[6];        
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
      
      if (typeof entry === "string") 
      {
        var lib = entry
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
      
      return window.qxlibraries[lib].resourceUri + "/" + id;
    }
  }
});
