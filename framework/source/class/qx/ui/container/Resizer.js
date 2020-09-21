/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * David Perez (david-perez)

************************************************************************ */

/**
 * The Resizer is a resizable container widget.
 *
 * It allows to be resized (not moved), normally in
 * the right and/or bottom directions. It is an alternative to splitters.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var resizer = new qx.ui.container.Resizer().set({
 *     width: 200,
 *     height: 100
 *   });
 *
 *   resizer.setLayout(new qx.ui.layout.Canvas());
 *   var text = new qx.ui.form.TextArea("Resize me\nI'm resizable");
 *   resizer.add(text, {edge: 0});
 *
 *   this.getRoot().add(resizer);
 * </pre>
 *
 * This example creates a resizer, configures it with a canvas layout and
 * adds a text area to it.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#desktop/widget/resizer.md' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.container.Resizer",
{
  extend    : qx.ui.container.Composite,
  include   : qx.ui.core.MResizable,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    appearance :
    {
      refine : true,
      init : "resizer"
    }
  }
});
