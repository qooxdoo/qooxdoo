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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A cross browser iframe instance.
 * 
 */
qx.Class.define("qx.html.Iframe",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */
    /*
    // overridden
    _createDomElement : function()
    {
      var el = qx.bom.Iframe.create(this._content);

      return el;
    },
    */

    /*
    ---------------------------------------------------------------------------
      IFRAME API
    ---------------------------------------------------------------------------
    */

    getWindow : function()
    {
      return qx.bom.Iframe.getWindow(this._element);
    },
    
    getDocument : function()
    {
      return qx.bom.Iframe.getDocument(this._element);
    },
    
    getBody : function()
    {
      return qx.bom.Iframe.getBody(this._element);
    }
  

  }
});
