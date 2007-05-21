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

qx.Class.define("qx.ui.form.InputCheckSymbol",
{
  extend : qx.ui.basic.Terminator,




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

    name :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_modifyName"
    },

    value :
    {
      init : null,
      nullable : true,
      apply : "_modifyValue"
    },

    type :
    {
      init : null,
      nullable : true,
      apply : "_modifyType"
    },

    checked :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyChecked"
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
     * @type member
     * @return {void}
     */
    _createElementImpl : function() {
      this.setElement(this.getTopLevelWidget().getDocumentElement().createElement("input"));
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyName : function(value, old) {
      return this.setHtmlProperty("name", value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyValue : function(value, old) {
      return this.setHtmlProperty("value", value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyType : function(value, old) {
      return this.setHtmlProperty("type", value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyChecked : function(value, old) {
      return this.setHtmlProperty("checked", value);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    getPreferredBoxWidth : function() {
      return 13;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    getPreferredBoxHeight : function() {
      return 13;
    },


    /**
     * TODOC
     *
     * @type member
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
          vElement.disabled = false;
        }
      },

      "default" : qx.lang.Function.returnTrue
    }),


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyEnabled : function(value, old)
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
