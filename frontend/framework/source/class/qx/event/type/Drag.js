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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event object class for drag events
 */
qx.Class.define("qx.event.type.Drag",
{
  extend : qx.event.type.Event,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    init : function(cancelable, original)
    {
      this.base(arguments, false, cancelable);

      this._native = original || null;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._native = this._native;

      return clone;
    },


    /**
     * Get the horizontal position at which the event occured relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @type member
     * @return {Integer} The horizontal mouse position in the document.
     * @signature function()
     */
    getDocumentLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this._native == null) {
          return 0;
        }

        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientX + qx.bom.Viewport.getScrollLeft(win);
      },

      // opera, webkit and gecko
      "default" : function()
      {
        if (this._native == null) {
          return 0;
        }

        return this._native.pageX;
      }
    }),


    /**
     * Get the vertical position at which the event occured relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @type member
     * @return {Integer} The vertical mouse position in the document.
     * @signature function()
     */
    getDocumentTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this._native == null) {
          return 0;
        }

        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientY + qx.bom.Viewport.getScrollTop(win);
      },

      // opera, webkit and gecko
      "default" : function()
      {
        if (this._native == null) {
          return 0;
        }

        return this._native.pageY;
      }
    }),




    getManager : function() {
      return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
    },

    addData : function(type, data) {
      this.getManager().addData(type, data);
    },

    addAction : function(type) {
      this.getManager().addAction(type);
    },

    supportsType : function(type) {
      return this.getManager().supportsType(type);
    },

    supportsAction : function(action) {
      return this.getManager().supportsAction(action);
    },

    getData : function(type) {
      return this.getManager().getData(type);
    },

    getAction : function() {
      return this.getManager().getAction();
    }
  }
});
