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

************************************************************************ */

qx.Class.define("qx.legacy.ui.form.InputCheckSymbol",
{
  extend : qx.legacy.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setSelectable(false);

    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      // Take control over size of element (mshtml)
      this.setWidth(13);
      this.setHeight(13);
    }
    else if (qx.core.Variant.isSet("qx.client", "gecko"))
    {
      // Remove gecko default margin
      this.setMargin(0);
    }

    // we need to be sure that the dom protection of this is added
    this.initTabIndex();
    this.setChecked(false);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    tabIndex :
    {
      refine : true,
      init : -1
    },

    /**  Represents the HtmlProperty "name" */
    name :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyName"
    },

    /** Represents the HtmlProperty "value" */
    value :
    {
      init : null,
      nullable : true,
      apply : "_applyValue"
    },

    /** Represents the HtmlProperty "type" */
    type :
    {
      init : null,
      nullable : true,
      apply : "_applyType"
    },

    /** Represents the HtmlProperty "checked" */
    checked :
    {
      check : "Boolean",
      init : false,
      apply : "_applyChecked"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Create widget with empty element
     *
     * @return {void}
     */
    _createElementImpl : function() {
      this.setElement(this.getTopLevelWidget().getDocumentElement().createElement("input"));
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyName : function(value, old) {
      return this.setHtmlProperty("name", value);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyValue : function(value, old) {
      return this.setHtmlProperty("value", value);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyType : function(value, old) {
      return this.setHtmlProperty("type", value);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyChecked : function(value, old) {
      return this.setHtmlProperty("checked", value);
    },


    /**
     * Returns the box width of the checkbox widget.
     * Currently this value is 13.
     *
     * @return {int} Box width of the checkbox
     */
    getPreferredBoxWidth : function() {
      return 13;
    },


    /**
     * Returns the box height of the checkbox widget.
     * Currently this value is 13.
     *
     * @return {int} Box height of the checkbox
     */
    getPreferredBoxHeight : function() {
      return 13;
    },


    /**
     * Sets an additional HtmlProperty "disabled" for the IE
     * if the checkbox widget is not enabled.
     *
     * @return {void}
     * @signature function()
     */
    _afterAppear : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this.base(arguments);

        var vElement = this.getElement();
        vElement.checked = this.getChecked();

        if (this.getEnabled()===false) {
          vElement.disabled = true;
        }
      },

      "default" : qx.lang.Function.returnTrue
    }),


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void} TODOC
     */
    _applyEnabled : function(value, old)
    {
      value===false ? this.setHtmlProperty("disabled", "disabled") : this.removeHtmlProperty("disabled");
      return this.base(arguments, value, old);
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    members.getBoxWidth = members.getPreferredBoxWidth;
    members.getBoxHeight = members.getPreferredBoxHeight;

    members.getInnerWidth = members.getPreferredBoxWidth;
    members.getInnerHeight = members.getPreferredBoxHeight;
  }
});
