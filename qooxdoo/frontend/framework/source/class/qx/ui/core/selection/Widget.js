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
 * This class represents a selection and manages incoming events for widgets
 * which need selection support.
 */
qx.Class.define("qx.ui.core.selection.Widget",
{
  extend : qx.ui.core.selection.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(widget)
  {
    this.base(arguments);

    if (widget != null) {
      this.setWidget(widget);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** This contains the currently assigned widget (qx.ui.form.List, ...) */
    widget :
    {
      check : "qx.ui.core.selection.IContainer",
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
    // overridden
    getItems : function() {
      return this.getWidget().getSelectableItems();
    },


    // overridden
    getNextItem : function(item) {
      return this.getWidget().getNextSelectableItem(item);
    },


    // overridden
    getPreviousItem : function(item) {
      return this.getWidget().getPreviousSelectableItem(item);
    },


    // overridden
    renderItemSelectionState : function(item, isSelected) {
      isSelected ? item.addState("selected") : item.removeState("selected");
    },


    // overridden
    renderItemAnchorState : function(item, isAnchor) {
      isAnchor ? item.addState("anchor") : item.removeState("anchor");
    },


    // overridden
    renderItemLeadState : function(item, isLead) {
      isLead ? item.addState("lead") : item.removeState("lead");
    }
  }
});
