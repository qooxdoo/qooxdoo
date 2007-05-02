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

#module(ui_form)

************************************************************************ */

/**
 * @appearance list-item
 */
qx.Class.define("qx.ui.form.ListItem",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vValue)
  {
    this.base(arguments, vText, vIcon);

    if (vValue != null) {
      this.setValue(vValue);
    }

    this.addEventListener("dblclick", this._ondblclick);

    // Initialize properties
    // Hint: width is already initialized in Atom
    this.initMinWidth();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "list-item"
    },

    minWidth :
    {
      refine : true,
      init : "auto"
    },

    width :
    {
      refine : true,
      init : null
    },

    allowStretchX :
    {
      refine : true,
      init : true
    },

    value : {
      event : "changeValue"
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
      STATE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    handleStateChange : function()
    {
      if (this.hasState("lead"))
      {
        this.setStyleProperty("MozOutline", "1px dotted invert");
        this.setStyleProperty("outline", "1px dotted invert");
      }
      else
      {
        this.removeStyleProperty("MozOutline");
        this.setStyleProperty("outline", "0px none");
      }
    },

    // Remove default outline focus border
    /**
     * TODOC
     *
     * @type member
     * @param vStates {var} TODOC
     * @return {void}
     */
    _applyStateStyleFocus : function(vStates) {},




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {var} TODOC
     */
    matchesString : function(vText) {
      return vText != "" && this.getLabel().toLowerCase().indexOf(vText.toLowerCase()) == 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {var} TODOC
     */
    matchesStringExact : function(vText) {
      return vText != "" && this.getLabel().toLowerCase() == String(vText).toLowerCase();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {var} TODOC
     */
    matchesValue : function(vText) {
      return vText != "" && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {var} TODOC
     */
    matchesValueExact : function(vText) {
      return vText != "" && this.getValue().toLowerCase() == String(vText).toLowerCase();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondblclick : function(e)
    {
      var vCommand = this.getCommand();

      if (vCommand) {
        vCommand.execute();
      }
    }
  }
});
