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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The small folder open/close button
 */
qx.Class.define("qx.ui.tree.FolderOpenButton",
{
  extend : qx.ui.basic.Image,
  include : qx.ui.core.MExecutable,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.initOpen();

    this.addListener("keypress", this._onKeyPress);
    this.addListener("click", this._onClick);
    this.addListener("mousedown", this._stopPropagation, this);
    this.addListener("mouseup", this._stopPropagation, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the button state is "open"
     */
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyOpen : function(value, old)
    {
      value ? this.addState("opened") : this.removeState("opened");
      this.execute();
    },


    /**
     * Listener method for "keydown" event.
     *
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @param e {qx.ui.event.KeySequence} Key event
     */
    _onKeyPress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.toggleOpen();
          e.stopPropagation();
      }
    },


    /**
     * Stop click event propagation
     *
     * @param e {qx.event.type.Event} The event object
     */
    // TODO: Could this be done somewhere else. The whole event
    // connection stuff on this widget (used by AbstractTreeItem)
    // needs optimization.
    _stopPropagation : function(e) {
      e.stopPropagation();
    },


    /**
     * Mouse click event listener
     *
     * @param e {qx.ui.event.Mouse} Mouse event
     */
    _onClick : function(e)
    {
      this.toggleOpen();
      e.stopPropagation();
    }
  }
});
