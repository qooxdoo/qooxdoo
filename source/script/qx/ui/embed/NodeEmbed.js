/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#module(simpleterminators)

************************************************************************ */

qx.OO.defineClass("qx.ui.embed.NodeEmbed", qx.ui.basic.Terminator, 
function(vId)
{
  qx.ui.basic.Terminator.call(this);

  if (qx.util.Validation.isValidString(vId)) {
    this.setSourceNodeId(vId);
  };
});

qx.OO.addProperty({ name : "sourceNodeId", type : qx.constant.Type.STRING });

qx.Proto._createElementImpl = function()
{
  var vNode = document.getElementById(this.getSourceNodeId());

  if (!vNode) {
    throw new Error("Could not find source node with ID: " + this.getSourceNodeId());
  };

  vNode.style.display = qx.constant.Core.EMPTY;

  return this.setElement(vNode);
};
