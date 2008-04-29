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
     * Til Schneider (til132)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Container widget for internal frames (iframes).
 *
 * An iframe can display any HTML page inside the widget.
 *
 * @appearance iframe
 */
qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(source)
  {
    this._source = source;
    this.base(arguments);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {

  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    source :
    {
      check : "String",
      apply : "_applySource"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContentElement : function() {
      return new qx.html.Iframe(this._source);
    },
    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */





    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySource : function(value, old)
    {
      this.getContentElement().setSource(value);
    }





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */





    /*
    ---------------------------------------------------------------------------
      LOAD STATUS
    ---------------------------------------------------------------------------
    */

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
  }

});
