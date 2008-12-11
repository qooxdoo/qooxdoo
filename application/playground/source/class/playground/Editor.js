/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/*)
#asset(playground/*)

************************************************************************ */

qx.Class.define("playground.Editor",
{
  extend : qx.ui.core.Widget,

  construct : function(pTextarea, pWidth, pHeight)
  {
    this.base(arguments, pTextarea, pWidth, pHeight);

    this.textarea = pTextarea;
    this.width = pWidth;
    this.height = pHeight;

    this.editor = this.addCodeMirror(CodeMirror.replace(this.textarea.getContentElement().getDomElement()),
    {
      content            : this.textarea.getValue(),
      parserfile         : [ "tokenizejavascript.js", "parsejavascript.js" ],
      stylesheet         : "css/jscolors.css",
      path               : "js/",
      textWrapping       : false,
      continuousScanning : false,
      width              : this.width + "px",
      height             : this.height + "px",
      autoMatchParens    : true
    });
  },

  members :
  {
    /**
     * replaces the current textarea and creates an Iframe 
     * with sytax highlighting
     *
     * @param place {var} the current textarea
     * @param options {var} to define extra functions of the editor
     * @return {var} mirror the current editor with syntax highlighting
     */
    addCodeMirror : function(place, options)
    {
      this.home = document.createElement("DIV");

      if (place.appendChild) place.appendChild(this.home);
      else place(this.home);

      this.mirror = new CodeMirror(this.home, options);

      return this.mirror;
    },


    /**
     * returns the created editor.
     *
     * @return {var} TODOC
     */
    getEditor : function() {
      return this.editor;
    }
  }
});