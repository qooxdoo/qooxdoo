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

#module(ui_basic)

************************************************************************ */

/**
 * A CanvasLayout, which can be placed inside an arbitrary HTML DOM element.
 * This widget can be used to embed qooxdoo widgets inside a normal
 * HTML page.
 */
qx.Class.define("qx.ui.basic.Inline",
{
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vId {String} id of the DOM element which should become the
   *     parent node of this widget.
   */
  construct : function(vId)
  {
    this.base(arguments);

    this.setStyleProperty("position", "relative");

    if (vId != null) {
      this.setInlineNodeId(vId);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
     /**
      * id of the DOM element which should become the
      * parent node of this widget. Don't change this property after the widget
      * is rendered!
      */
    inlineNodeId :
    {
      check : "String",
      nullable : true
    }
  }
});
