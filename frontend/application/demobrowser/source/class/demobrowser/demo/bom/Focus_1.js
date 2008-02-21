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

qx.Class.define("demobrowser.demo.bom.Focus_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // document.body.focus();

      qx.event.Registration.addListener(document.documentElement, "activate", this._onActivate, this, true);
      qx.event.Registration.addListener(document.documentElement, "deactivate", this._onDeactivate, this, true);
      qx.event.Registration.addListener(document.documentElement, "focusin", this._onFocusIn, this);
      qx.event.Registration.addListener(document.documentElement, "focusout", this._onFocusOut, this);

      qx.event.Registration.addListener(window, "focus", this._onWindowFocus, this);
      qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this);

      var h2 = document.getElementById("h2");
      qx.bom.Element.addListener(h2, "mouseup", this._onHeaderMouseUp, this);

      var f1 = document.getElementById("f1");
      qx.bom.Element.addListener(f1, "keydown", this._onInputKeyDown, this);

      qx.bom.Element.addListener(document.body, "keydown", this._onAnyKeyDown, this);
    },

    _onWindowFocus : function(e)
    {
      this.debug("Window focussed");
    },

    _onWindowBlur : function(e)
    {
      this.debug("Window blurred");
    },

    _onActivate : function(e)
    {
      this.debug("Activate: " + e.getTarget());
      e.getTarget().style.background = "#E8ECF6";
    },

    _onDeactivate : function(e)
    {
      this.debug("Deactivate: " + e.getTarget());
      e.getTarget().style.background = "";
    },

    _onFocusIn : function(e)
    {
      this.debug("FocusIn: " + e.getTarget());

      if (qx.bom.client.Engine.MSHTML)
      {
        e.getTarget().style.border = "1px dotted black";
      }
      else
      {
        e.getTarget().style.outline = "1px dotted black";
      }
    },

    _onFocusOut : function(e)
    {
      this.debug("FocusOut: " + e.getTarget());

      if (qx.bom.client.Engine.MSHTML) {
        e.getTarget().style.border = "1px solid black";
      } else {
        e.getTarget().style.outline = "";
      }
    },

    _onHeaderMouseUp : function(e)
    {
      var f1 = document.getElementById("f1");

      // These both should work identical
      // qx.bom.Element.focus(f1);
      f1.focus();
    },

    _onInputKeyDown : function(e)
    {
      this.debug("Input-Field: " + e.getKeyIdentifier());
      if (e.getKeyIdentifier() === "Enter" || e.getKeyIdentifier() === "Escape")
      {
        this.debug("Blur field");

        // These both should work identical
        // qx.bom.Element.blur(e.getTarget());

        e.getTarget().blur();
      }
    },

    _onAnyKeyDown : function(e)
    {
      this.debug("Key-Action on " + e.getTarget() + " [" + e.getKeyIdentifier() + "]");

    }

  }
});
