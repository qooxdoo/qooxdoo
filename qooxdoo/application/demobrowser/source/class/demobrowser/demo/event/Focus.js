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

qx.Class.define("demobrowser.demo.event.Focus",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.event.Registration.addListener(document.documentElement, "activate", this._onActivate, this, true);
      qx.event.Registration.addListener(document.documentElement, "deactivate", this._onDeactivate, this, true);
      qx.event.Registration.addListener(document.documentElement, "focusin", this._onFocusIn, this);
      qx.event.Registration.addListener(document.documentElement, "focusout", this._onFocusOut, this);

      qx.event.Registration.addListener(window, "focus", this._onWindowFocus, this);
      qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this);
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
        e.getTarget().style.border = "1px dotted red";
      }
      else
      {
        e.getTarget().style.outline = "1px dotted red";
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
    }
  }
});
