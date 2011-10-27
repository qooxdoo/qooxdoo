/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.list.ListItem",
{
  extend : qx.core.Object,

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   * @param value {String?null} The items string value
   */
  construct : function(label, icon, value)
  {
    this.base(arguments);

    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (value != null) {
      this.setValue(value);
    }
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label :
    {
      nullable : true,
      dereference : true,
      check : "String"
    },

    /** Any URI String supported by qx.ui.basic.Image to display a icon */
    icon :
    {
      check : "String",
      nullable : true
    },

    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    manager :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyManager"
    },

    /** Fires a "changeValue" (qx.event.type.Data) event */
    value :
    {
      check : "String",
      nullable : true,
      event : "changeValue"
    },

    /** The item's width. */
    width :
    {
      check : "Integer",
      nullable : true,
      event : "changeWidth",
      init : null
    },

    /** The item's height. */
    height :
    {
      check : "Integer",
      nullable : true,
      event : "changeHeight",
      init : null
    }
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyManager : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /*
    ---------------------------------------------------------------------------
      SEARCH VALUE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the searchable value of the list item.
     *
     * This is normally the real value with a fallback to the label like in HTML
     * select boxes.
     */
    getFormValue : function()
    {
      var value = this.getValue();
      if (value == null) {
        value = this.getLabel();
      }

      return value;
    }

  }
});
