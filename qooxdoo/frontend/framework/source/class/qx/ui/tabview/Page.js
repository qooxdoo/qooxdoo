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
     * Martin Wittemann (martinwittemann)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.tabview.Page",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon)
  {
    this.base(arguments);

    this._createChildControl("button");

    // init
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    //this._button = this._createButton(label, icon);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance : 
    {
      refine : true,
      init : "tabview-page"
    },
    

    /** The label/caption/text of the Page's button. */
    label :
    {
      check : "String",
      init : "",
      apply : "_applyLabel"
    },
    
    
    /** Any URI String supported by qx.ui.basic.Image to display an icon in Page's button. */
    icon :
    {
      check : "String",
      init : "",
      apply : "_applyIcon"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

     /*
     ---------------------------------------------------------------------------
       APPLY ROUTINES
     ---------------------------------------------------------------------------
     */

     // property apply
     _applyIcon : function(value, old) {
       this._getChildControl("button").setIcon(value);
     },

     // property apply
     _applyLabel : function(value, old) {
       this._getChildControl("button").setLabel(value);
     },

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button":
          control = new qx.ui.form.RadioButton;
          // add a listener for hiding and showing the sites
          control.addListener("change", function(e)
          {
            if (e.getValue()) {
              this.show();
            } else {
              // Use exclude() and not hide() because of
              // "getCurrentPage" in the TabView class
              this.exclude();
            }
          }, this);

          this._add(control);
          break;
      }
      
      return control || this.base(arguments, id);
    },

    
    
    /**
     * Returns the button used within this page. This method is used by
     * the TabView to access the button.
     *
     * @internal
     * @return {qx.ui.form.RadioButton} The button associated with this page.
     */
    getButton: function() {
      return this._getChildControl("button");
    },

    /**
     * Overridden apply method.
     * Enables the page and the assicoated button.
     *
     * @param value {boolean} The new value.
     * @param old {boolean} The old value.
     */
    _applyEnabled: function(value, old)
    {
      this.base(arguments, value, old);

      // since enabled is inheritable value may be null
      if (value == null) {
        this._getChildControl("button").resetEnabled();
      } else {
        this._getChildControl("button").setEnabled(value);
      }
    }
  }

});
