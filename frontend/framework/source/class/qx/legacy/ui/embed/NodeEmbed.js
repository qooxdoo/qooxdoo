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

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

qx.Class.define("qx.ui.embed.NodeEmbed",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vId)
  {
    this.base(arguments);

    if (vId != null) {
      this.setSourceNodeId(vId);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    sourceNodeId :
    {
      check : "String",
      nullable : true
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
     * @return {void} TODOC
     * @throws TODOC
     */
    _createElementImpl : function()
    {
      var vNode = document.getElementById(this.getSourceNodeId());

      if (!vNode) {
        throw new Error("Could not find source node with ID: " + this.getSourceNodeId());
      }

      vNode.style.display = "";

      return this.setElement(vNode);
    }
  }
});
