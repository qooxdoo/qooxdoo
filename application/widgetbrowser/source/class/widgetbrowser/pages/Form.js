/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Demonstrates qx.ui.form(...):
 *
 * AbstractField, AbstractSelectBox, Button, CheckBox, ComboBox, DateField,
 * HoverButton, List, ListItem, MenuButton, PasswordField, RadioButton,
 * RadioButtonGroup, RepeatButton, SelectBox, Slider, Spinner, SplitButton,
 * TextArea, TextField, ToggleButton
 *
 * @ignore(qxc)
 */
qx.Class.define("widgetbrowser.pages.Form",
{
  extend: widgetbrowser.pages.AbstractPage,

  statics:
  {
    ITEM_SIZE: 3
  },

  construct : function()
  {
    this.base(arguments);

    var formItems = new qxc.application.formdemo.FormItems();
    this._widgets = formItems.getWidgets();
    this.add(formItems);
  }
});
