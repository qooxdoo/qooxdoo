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

qx.Clazz.define("qx.ui.embed.LinkEmbed",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml, vUri, vTarget)
  {
    qx.ui.embed.HtmlEmbed.call(this, vHtml);

    if (typeof vUri != "undefined") {
      this.setUri(vUri);
    }

    if (typeof vTarget != "undefined") {
      this.setTarget(vTarget);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    LINK_START : "<a target='",
    HREF_START : "' href='",
    HREF_STOP  : "'>",
    LINK_STOP  : "</a>"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Any valid html URI */
    uri :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "#",
      impl         : "html"
    },


    /** Any valid html target */
    target :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "_blank",
      impl         : "html"
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

      vHtml.push(qx.ui.embed.LinkEmbed.LINK_START);
      vHtml.push(this.getTarget());
      vHtml.push(qx.ui.embed.LinkEmbed.HREF_START);
      vHtml.push(this.getUri());
      vHtml.push(qx.ui.embed.LinkEmbed.HREF_STOP);
      vHtml.push(this.getHtml());
      vHtml.push(qx.ui.embed.LinkEmbed.LINK_STOP);

      this.getElement().innerHTML = vHtml.join("");
    }
  }
});
