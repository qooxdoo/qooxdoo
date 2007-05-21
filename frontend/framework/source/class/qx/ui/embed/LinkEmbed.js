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


************************************************************************ */

qx.Class.define("qx.ui.embed.LinkEmbed",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml, vUri, vTarget)
  {
    this.base(arguments, vHtml);

    if (vUri != null) {
      this.setUri(vUri);
    }

    if (vTarget != null) {
      this.setTarget(vTarget);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Any valid html URI */
    uri :
    {
      check : "String",
      init : "#",
      apply : "_applyHtml"
    },


    /** Any valid html target */
    target :
    {
      check : "String",
      init : "_blank",
      apply : "_applyHtml"
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncHtml : function()
    {
      var vHtml = [];

      vHtml.push("<a target='");
      vHtml.push(this.getTarget());
      vHtml.push("' href='");
      vHtml.push(this.getUri());
      vHtml.push("'>");
      vHtml.push(this.getHtml());
      vHtml.push("</a>");

      this.getElement().innerHTML = vHtml.join("");
    }
  }
});
