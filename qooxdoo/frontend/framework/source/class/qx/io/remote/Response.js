/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */

qx.Class.define("qx.io.remote.Response",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(eventType) {
    this.base(arguments, eventType);
  },




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

    state :
    {
      check : "Integer",
      nullable : true
    },


    /** Status code of the response. */
    statusCode :
    {
      check : "Integer",
      nullable : true
    },

    content : {
      nullable : true
    },

    responseHeaders :
    {
      check : "Object",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vHeader {var} TODOC
     * @return {var | null} TODOC
     */
    getResponseHeader : function(vHeader)
    {
      var vAll = this.getResponseHeaders();

      if (vAll) {
        return vAll[vHeader] || null;
      }

      return null;
    },


    /**
     * @deprecated This method is no longer needed since the event object is now an
     *     instance of the Response class.
     */
     getData : function()
     {
       return this;
     }
  }
});
