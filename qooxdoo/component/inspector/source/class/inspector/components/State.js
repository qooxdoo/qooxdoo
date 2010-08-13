/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.components.State",
{
  extend : qx.core.Object,

  construct : function() {
    this.base(arguments);

    this.__windows = [];
  },
  
  properties :
  {
    ignoreChanges :
    {
      check: "Boolean",
      init: false
    }
  },

  members :
  {
    __windows : null,

    add : function(win, cookieKey)
    {
      if (!qx.lang.Array.contains(this.__windows, win)) {
        win.setUserData("cookieKey", cookieKey);
        this.__windows.push(win);
        this.__observeState(win);
      }
    },

    __observeState : function(win) {
      var cookieKey = win.getUserData("cookieKey");

      var listeners = [];
      var id = null;

      id = win.addListener("open", function() {
        if (!this.isIgnoreChanges()) {
          qx.bom.Cookie.set(cookieKey + "Open", true, 7);
        }
      }, this);
      listeners.push(id);

      id = win.addListener("close", function() {
        if (!this.isIgnoreChanges()) {
          qx.bom.Cookie.set(cookieKey + "Open", false, 7);
        }
      }, this);
      listeners.push(id);

      id = win.addListener("move", function(event) {
        if (!this.isIgnoreChanges())
        {
          qx.bom.Cookie.set(cookieKey + "Left", event.getData().left, 7);
          qx.bom.Cookie.set(cookieKey + "Top", event.getData().top, 7);
        }
      }, this);
      listeners.push(id);

      id = win.addListener("resize", function(event) {
        if (!this.isIgnoreChanges())
        {
          qx.bom.Cookie.set(cookieKey + "Width", event.getData().width, 7);
          qx.bom.Cookie.set(cookieKey + "Height", event.getData().height, 7);
        }
      }, this);
      listeners.push(id);

      win.setUserData("listeners", listeners);
    },

    restoreState : function()
    {
      for (var i = 0; i < this.__windows.length; i++) {
        this.__restoreStateFrom(this.__windows[i]);
      }
    },

    __restoreStateFrom : function(win)
    {
      var cookieKey = win.getUserData("cookieKey");

      var open = qx.bom.Cookie.get(cookieKey + "Open");
      var left = parseInt(qx.bom.Cookie.get(cookieKey + "Left"));
      var top = parseInt(qx.bom.Cookie.get(cookieKey + "Top"));
      var width = parseInt(qx.bom.Cookie.get(cookieKey + "Width"));
      var height = parseInt(qx.bom.Cookie.get(cookieKey + "Height"));

      if (open === "true" || open === null) {
        win.open();
        
        win.setSizeAndPosition(
        {
          top: top,
          left: left,
          width: width,
          height: height
        });
      }
    }
  },

  destruct : function() {
    for (var i = 0; i < this.__windows.length; i++) {
      var win = this.__windows[i];
      var listeners = win.getUserData("listeners");

      if (listeners != null)
      {
        var id = listeners.pop()
        while (id != null)
        {
          win.removeListenerById(id)
          id = listeners.pop()
        }
      }
    }

    this.__windows = null;
  }
});
