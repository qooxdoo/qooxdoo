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

#module(ui_treefullcontrol)

************************************************************************ */

qx.Class.define("qx.manager.selection.TreeFullControlSelectionManager",
{
  extend : qx.manager.selection.TreeSelectionManager,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vBoundedWidget) {
    this.base(arguments, vBoundedWidget);
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
      MAPPING TO BOUNDED WIDGET
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getNext : function(vItem)
    {
      if (vItem)
      {
        if (qx.ui.treefullcontrol.Tree.isOpenTreeFolder(vItem)) {
          return vItem.getFirstVisibleChildOfFolder();
        }
        else if (vItem.isLastVisibleChild())
        {
          var vCurrent = vItem;

          while (vCurrent && vCurrent.isLastVisibleChild()) {
            vCurrent = vCurrent.getParentFolder();
          }

          if (vCurrent && vCurrent instanceof qx.ui.treefullcontrol.AbstractTreeElement && vCurrent.getNextVisibleSibling() && vCurrent.getNextVisibleSibling() instanceof qx.ui.treefullcontrol.AbstractTreeElement) {
            return vCurrent.getNextVisibleSibling();
          }
        }
        else
        {
          return vItem.getNextVisibleSibling();
        }
      }
      else
      {
        return this.getBoundedWidget().getFirstTreeChild();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {void | var} TODOC
     */
    getPrevious : function(vItem)
    {
      if (vItem)
      {
        if (vItem == this.getBoundedWidget()) {
          return;
        }
        else if (vItem.isFirstVisibleChild())
        {
          if (vItem.getParentFolder() instanceof qx.ui.treefullcontrol.TreeFolder) {
            return vItem.getParentFolder();
          }
        }
        else
        {
          var vPrev = vItem.getPreviousVisibleSibling();

          if (vPrev instanceof qx.ui.treefullcontrol.AbstractTreeElement)
          {
            while (vPrev instanceof qx.ui.treefullcontrol.AbstractTreeElement)
            {
              if (qx.ui.treefullcontrol.Tree.isOpenTreeFolder(vPrev)) {
                vPrev = vPrev.getLastVisibleChildOfFolder();
              } else {
                break;
              }
            }
          }

          return vPrev;
        }
      }
      else
      {
        return this.getBoundedWidget().getLastTreeChild();
      }
    },



    /*
    ---------------------------------------------------------------------------
      MAPPING TO ITEM DIMENSIONS
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getItemHeight : function(vItem)
    {
      if (vItem instanceof qx.ui.treefullcontrol.TreeFolder && vItem._horizontalLayout) {
        return vItem._horizontalLayout.getOffsetHeight();
      } else {
        return vItem.getOffsetHeight();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    scrollItemIntoView : function(vItem)
    {
      if (vItem instanceof qx.ui.treefullcontrol.TreeFolder && vItem._horizontalLayout) {
        return vItem._horizontalLayout.scrollIntoView();
      } else {
        return vItem.scrollIntoView();
      }
    }

  }
});
