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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This class is used to work with the result of a HTTP request.
 */
qx.Class.define("qx.io.remote.Response",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** State of the response. */
    state :
    {
      check    : "Integer",
      nullable : true
    },

    /** Status code of the response. */
    statusCode :
    {
      check    : "Integer",
      nullable : true
    },

    /** Content of the response. */
    content :
    {
      nullable : true
    },

    /** The headers of the response. */
    responseHeaders :
    {
      check    : "Object",
      nullable : true,
      apply : "_applyResponseHeaders"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lowerHeaders: null,

    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);
      clone.setType(this.getType());
      clone.setState(this.getState());
      clone.setStatusCode(this.getStatusCode());
      clone.setContent(this.getContent());
      clone.setResponseHeaders(this.getResponseHeaders());
      return clone;
    },


    /**
     * Returns a specific response header
     * @param vHeader {String} Response header name
     * @return {Object | null} The header value or null;
     */
    getResponseHeader : function(vHeader)
    {
      if (this.__lowerHeaders) {
        return this.__lowerHeaders[vHeader.toLowerCase()] || null;
      }

      return null;
    },

    /**
     * Keep lower-cased shadow of response headers for later
     * case-insensitive matching.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyResponseHeaders : function(value, old) {
      var lowerHeaders = {};

      if (value !== null) {
        qx.lang.Object.getKeys(value).forEach(function(key) {
          lowerHeaders[key.toLowerCase()] = value[key];
        });
        this.__lowerHeaders = lowerHeaders;
      }
    }
  }
});
