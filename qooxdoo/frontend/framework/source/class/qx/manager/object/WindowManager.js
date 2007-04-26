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

#module(ui_window)

************************************************************************ */

/** This singleton manages qx.ui.window.Windows */
qx.Class.define("qx.manager.object.WindowManager",
{
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    activeWindow :
    {
      check : "Object",
      nullable : true,
      apply : "_modifyActiveWindow"
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyActiveWindow : function(propValue, propOldValue, propData)
    {
      qx.manager.object.PopupManager.getInstance().update();

      if (propOldValue) {
        propOldValue.setActive(false);
      }

      if (propValue) {
        propValue.setActive(true);
      }

      if (propOldValue && propOldValue.getModal()) {
        propOldValue.getTopLevelWidget().release(propOldValue);
      }

      if (propValue && propValue.getModal()) {
        propValue.getTopLevelWidget().block(propValue);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param oTarget {Object} TODOC
     * @return {void}
     */
    update : function(oTarget)
    {
      var vWindow, vHashCode;
      var vAll = this.getAll();

      for (var vHashCode in vAll)
      {
        vWindow = vAll[vHashCode];

        if (!vWindow.getAutoHide()) {
          continue;
        }

        vWindow.hide();
      }
    },




    /*
    ---------------------------------------------------------------------------
      MANAGER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param w1 {var} TODOC
     * @param w2 {var} TODOC
     * @return {int | var} TODOC
     */
    compareWindows : function(w1, w2)
    {
      switch(w1.getWindowManager().getActiveWindow())
      {
        case w1:
          return 1;

        case w2:
          return -1;
      }

      return w1.getZIndex() - w2.getZIndex();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWindow {var} TODOC
     * @return {void}
     */
    add : function(vWindow)
    {
      this.base(arguments, vWindow);

      // this.debug("Add: " + vWindow);
      this.setActiveWindow(vWindow);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWindow {var} TODOC
     * @return {void}
     */
    remove : function(vWindow)
    {
      this.base(arguments, vWindow);

      // this.debug("Remove: " + vWindow);
      if (this.getActiveWindow() == vWindow)
      {
        var a = [];

        for (var i in this._objects) {
          a.push(this._objects[i]);
        }

        var l = a.length;

        if (l == 0) {
          this.setActiveWindow(null);
        } else if (l == 1) {
          this.setActiveWindow(a[0]);
        }
        else if (l > 1)
        {
          a.sort(this.compareWindows);
          this.setActiveWindow(a[l - 1]);
        }
      }
    }
  }
});
