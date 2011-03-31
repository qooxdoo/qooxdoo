/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The label widget displays a text or HTML content.
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var label = new qx.ui.mobile.basic.Label("Hello World");
 *
 *   this.getRoot().add(label);
 * </pre>
 *
 * This example create a widget to display the label.
 *
 */
qx.Class.define("qx.ui.mobile.basic.Label",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String?null} Text or HTML content to display
   */
  construct : function(value)
  {
    this.base(arguments);
    if (value) {
      this.setValue(value);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "label"
    },


    /**
     * Text or HTML content to display
     */
    value :
    {
      nullable : true,
      init : null,
      apply : "_applyValue",
      event : "changeValue"
    },


    // overridden
    anonymous :
    {
      refine : true,
      init : true
    },


    /**
     * Prevents a number from being displayed as a phone number.
     * Hint: Some android phones display any number as a phone number.
     * Call for help: Do you know a better solution for this hack?
     */
    preventPhoneNumber :
    {
      check : "Boolean",
      init : false,
      apply : "_applyAttribute"
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
    _applyValue : function(value, old)
    {
      if (this.getPreventPhoneNumber()) {
        value = this._preventPhoneNumberAutoDetection(value);
      }
      this._setHtml(value);
    },


    /**
     * Prevents a phone number from being auto detected
     *
     * @param string {String} The original string to format
     * @return {String} The formated string
     */
    _preventPhoneNumberAutoDetection : function (string)
    {
      if (string == null) {
        return;
      }
      string = "" + string;
      string = string.replace(/\r\n/g,"\n");

      var utftext = "";
      // Todo: check if only the non space / non breaking character is enough
      for (var n = 0; n < string.length; n++) {
        var chr = string.charAt(n);
        if (chr == "0") {
          utftext += "\uFEFF\u0030";
        } else if (chr == "1") {
          utftext += "\uFEFF\u0031";
        } else if (chr == "2") {
          utftext += "\uFEFF\u0032";
        }
        else if (chr == "3") {
          utftext += "\uFEFF\u0033";
        }
        else if (chr == "4") {
          utftext += "\uFEFF\u0034";
        }
        else if (chr == "5") {
          utftext += "\uFEFF\u0035";
        }
        else if (chr == "6") {
          utftext += "\uFEFF\u0036";
        }
        else if (chr == "7") {
          utftext += "\uFEFF\u0037";
        }
        else if (chr == "8") {
          utftext += "\uFEFF\u0038";
        }
        else if (chr == "9") {
          utftext += "\uFEFF\u0039";
        }
        else
        {
          utftext += chr;
        }
      }
      return utftext;
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    qx.ui.mobile.core.Widget.addAttributeMapping("preventPhoneNumber",
      {
        attribute : "data-preventPhoneNumber",
        values :
        {
          "true" : "true",
          "false" : null
        }
      }
    );
  }
});
