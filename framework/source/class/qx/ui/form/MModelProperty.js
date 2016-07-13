/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Can be included for implementing {@link qx.ui.form.IModel}. It only contains
 * a nullable property named 'model' with a 'changeModel' event.
 */
qx.Mixin.define("qx.ui.form.MModelProperty",
{
  properties :
  {
    /**
     * Model property for storing additional information for the including
     * object. It can act as value property on form items for example.
     *
     * Be careful using that property as this is used for the
     * {@link qx.ui.form.MModelSelection} it has some restrictions:
     *
     * * Don't use equal models in one widget using the
     *     {@link qx.ui.form.MModelSelection}.
     *
     * * Avoid setting only some model properties if the widgets are added to
     *     a {@link qx.ui.form.MModelSelection} widget.
     *
     * Both restrictions result of the fact, that the set models are deputies
     * for their widget.
     */
    model :
    {
      nullable : true,
      event : "changeModel",
      apply : "_applyModel",
      dereference : true
    }
  },


  members :
  {
    // apply method
    _applyModel : function(value, old) {
      // Empty implementation
    }
  }
});
