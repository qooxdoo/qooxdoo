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

#module(ui_layout)

************************************************************************ */

qx.Class.define("qx.ui.layout.DockLayout",
{
  extend : qx.ui.core.Parent,




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
    /** The layout mode (in which order the children should be layouted) */
    mode :
    {
      check : [ "vertical", "horizontal", "ordered" ],
      init : "vertical",
      apply : "_applyMode",
      themeable : true
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

    _applyMode : function(value, old) {
      this.addToQueueRuntime("mode");
    },




    /*
    ---------------------------------------------------------------------------
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @type member
     * @return {qx.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.ui.layout.impl.DockLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      ENHANCED CHILDREN FEATURES
    ---------------------------------------------------------------------------
    */

    /**
     * Add multiple childrens and make them left aligned
     *
     * @type member
     * @return {void}
     */
    addLeft : function() {
      this._addAlignedHorizontal("left", arguments);
    },


    /**
     * Add multiple childrens and make them right aligned
     *
     * @type member
     * @return {void}
     */
    addRight : function() {
      this._addAlignedHorizontal("right", arguments);
    },


    /**
     * Add multiple childrens and make them top aligned
     *
     * @type member
     * @return {void}
     */
    addTop : function() {
      this._addAlignedVertical("top", arguments);
    },


    /**
     * Add multiple childrens and make them bottom aligned
     *
     * @type member
     * @return {void}
     */
    addBottom : function() {
      this._addAlignedVertical("bottom", arguments);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAlign {var} TODOC
     * @param vArgs {var} TODOC
     * @return {void}
     */
    _addAlignedVertical : function(vAlign, vArgs)
    {
      for (var i=0, l=vArgs.length; i<l; i++) {
        vArgs[i].setVerticalAlign(vAlign);
      }

      this.add.apply(this, vArgs);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAlign {var} TODOC
     * @param vArgs {var} TODOC
     * @return {void}
     */
    _addAlignedHorizontal : function(vAlign, vArgs)
    {
      for (var i=0, l=vArgs.length; i<l; i++) {
        vArgs[i].setHorizontalAlign(vAlign);
      }

      this.add.apply(this, vArgs);
    }
  }
});
