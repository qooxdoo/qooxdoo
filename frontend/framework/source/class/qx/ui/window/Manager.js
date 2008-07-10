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

/** This singleton manages qx.ui.window.Windows */
qx.Class.define("qx.ui.window.Manager",
{
  extend : qx.util.Set,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** This property holds the current active window */
    active :
    {
      check : "Object",
      nullable : true,
      apply : "_applyActive"
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyActive : function(value, old)
    {
      if (old)
      {
        old.resetActive();
        this.sendToBack(old);
      }

      if (value)
      {
        value.setActive(true);
        this.bringToFront(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      MANAGER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Compares two windows (used as sort method in {@link #remove}).
     * Sorts the windows by checking which of the given windows is active.
     * If none of those two are active the zIndex are subtracted from each
     * other to determine the sort order.
     *
     * @type member
     * @param w1 {qx.ui.window.Window} first window to compare
     * @param w2 {qx.ui.window.Window} second window to compare
     * @return {int | var} 1 for first window active, -1 for second window active
     * and the subtraction of the zIndex if none of the two are active.
     */
    _compareWindows : function(w1, w2)
    {
      switch(w1.getWindowManager().getActive())
      {
        case w1:
          return 1;

        case w2:
          return -1;
      }

      return w1.getZIndex() - w2.getZIndex();
    },


    /**
     * Adds a {@link qx.ui.window.Window} instance to the manager and
     * sets it as active window.
     *
     * @type member
     * @param win {qx.ui.window.Window} window instance to add
     * @return {void}
     */
    add : function(win)
    {
      this.base(arguments, win);

      // this.debug("Add: " + win);
      this.setActive(win);
    },


    /**
     * Removes a {@link qx.ui.window.Window} instance from the manager.
     * If the current active window is the one which should be removed the
     * existing windows are compared to determine the new active window
     * (using the {@link #_compareWindows} method).
     *
     * @type member
     * @param win {qx.ui.window.Window} window instance
     * @return {void}
     */
    remove : function(win)
    {
      this.base(arguments, win);

      // this.debug("Remove: " + win);
      if (this.getActive() == win)
      {
        var a = [];

        for (var i in this._objects) {
          a.push(this._objects[i]);
        }

        var l = a.length;

        if (l == 0) {
          this.resetActive();
        } else if (l == 1) {
          this.setActive(a[0]);
        }
        else if (l > 1)
        {
          a.sort(this._compareWindows);
          this.setActive(a[l - 1]);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      Stack Positioning
    ---------------------------------------------------------------------------
    */

    /** {Integer} Minimum zIndex to start with for windows */
    _minZIndex : 1e5,


    /**
     * Gets all registered window instances (sorted by the zIndex) and resets
     * the zIndex on all instances.
     */
    _updateStack : function()
    {
      var list = this.getAll();

      list.sort(function(a, b) {
        return a.getZIndex() - b.getZIndex()
      });

      var zindex = this._minZIndex;
      for (var i=0, l=list.length; i<l; i++) {
        list[i].setZIndex(zindex++);
      }
    },


    /**
     * Brings the given window to front.
     *
     * @param win {qx.ui.window.Window} the window, which will be braught to front
     * @return {void}
     */
    bringToFront : function(win)
    {
      win.setZIndex(this._minZIndex+1000000);
      this._updateStack();
    },


    /**
     * Sends the given window to back.
     *
     * @param win {qx.ui.window.Window} the window, which will be sent to back
     * @return {void}
     */
    sendToBack : function(win)
    {
      win.setZIndex(this._minZIndex+1);
      this._updateStack();
    }
  }
});
