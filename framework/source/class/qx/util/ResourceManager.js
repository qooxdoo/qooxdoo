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
    __registry : window.qxresources || {},


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
      var entry = this.__registry[id];
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
      var entry = this.__registry[id];
      return entry ? entry[1] : null;
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
      var entry = this.__registry[id];
      return entry && entry.length > 4;
    },


    /**
     * Returns the source and location of a image when
     * it is clipped. Otherwise returns pseudo values
     * to work with a simple image
     *
     * @param id {String} Resource identifier
     * @return {Map} Image data for a clipped image. Has the keys
     *    <code>source</code>, <code>left</code> and <code>top</code>.
     */
    getClippedImageData : function(id)
    {
      var entry = this.__registry[id];
      if (!entry) {
        return null;
      }

      if (entry.length < 5)
      {
        return {
          source : id,
          left : 0,
          top : 0
        };
      }
      else
      {
        return {
          source : entry[4],
          left : entry[5],
          top : entry[6]
        };
      }
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
