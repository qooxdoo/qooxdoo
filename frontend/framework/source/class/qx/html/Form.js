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

#module(io_remote)

************************************************************************ */

qx.Class.define("qx.html.Form",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    ignoreInputTypes : [ "file", "submit", "image", "reset", "button" ],
    ignoreElementTypes : [ "fieldset" ],
    checkElementTypes : [ "radio", "checkbox" ],
    multiSelectType : "select-multiple",


    /**
     * TODOC
     *
     * @type static
     * @param vNode {var} TODOC
     * @return {Boolean} TODOC
     */
    inputFilter : function(vNode)
    {
      if (vNode.disabled) {
        return false;
      }

      var vTag = (vNode.tagName || "").toLowerCase();

      if (qx.lang.Array.contains(qx.html.Form.ignoreElementTypes, vTag)) {
        return false;
      }

      var vType = vNode.type.toLowerCase();

      if (qx.lang.Array.contains(qx.html.Form.ignoreInputTypes, vType)) {
        return false;
      }

      if (!vNode.checked && qx.lang.Array.contains(qx.html.Form.checkElementTypes, vType)) {
        return false;
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type static
     * @param vForm {var} TODOC
     * @return {var} TODOC
     */
    getFields : function(vForm) {
      return Array.filter(vForm.elements, qx.html.Form.inputFilter);
    },


    /**
     * TODOC
     *
     * @type static
     * @param vNode {var} TODOC
     * @return {var} TODOC
     */
    encodeField : function(vNode)
    {
      var vName = vNode.name || "";
      var vType = (vNode.type || "").toLowerCase();

      if (vType === qx.html.Form.multiSelectType)
      {
        var vValues = [];

        for (var i=0; i<vNode.options.length; i++)
        {
          if (vNode.options[i].selected) {
            vValues.push(vName + "=" + vNode.options[i].value);
          }
        }

        return vValues.join("&");
      }
      else
      {
        return vName + "=" + vNode.value;
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param vForm {var} TODOC
     * @return {var} TODOC
     */
    encodeForm : function(vForm)
    {
      var vFields = qx.html.Form.getFields(vForm);
      var vAll = [];

      for (var i=0, l=vFields.length; i<l; i++) {
        vAll.push(qx.html.Form.encodeField(vFields[i]));
      }

      return vAll.join("&");
    },


    /**
     * TODOC
     *
     * @type static
     * @param vForm {var} TODOC
     * @param vMethod {var} TODOC
     * @return {void}
     */
    bind : function(vForm, vMethod)
    {
      qx.html.EventRegistration.addEventListener(vForm, "submit", function(e)
      {
        e.returnValue = false;

        if (typeof e.preventDefault === "function") {
          e.preventDefault();
        }

        return vMethod(e);
      });
    }
  }
});
