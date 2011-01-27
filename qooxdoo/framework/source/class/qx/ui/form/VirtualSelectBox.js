/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.ui.form.VirtualSelectBox",
{
  extend : qx.ui.form.AbstractVirtualPopupList,

  construct : function(model)
  {
    this.base(arguments, model);

    this._createChildControl("atom");
    this._createChildControl("spacer");
    this._createChildControl("arrow");

    // Register listener
    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
    this.addListener("changeLabelPath", this.__bindAtom, this);
    this.addListener("changeLabelOptions", this.__bindAtom, this);
    this.addListener("changeIconPath", this.__bindAtom, this);
    this.addListener("changeIconOptions", this.__bindAtom, this);

    this.initSelection(this.getChildControl("dropdown").getSelection());

    qx.ui.core.queue.Widget.add(this);
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-selectbox"
    },


    /** Current selected items */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as an icon. This is only needed if objects are stored in the
     * model and icons should be displayed.
     */
    iconPath :
    {
      check: "String",
      event : "changeIconPath",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions :
    {
      apply: "_applyIconOptions",
      event : "changeIconOptions",
      nullable: true
    }
  },


  members :
  {
    // overridden
    syncWidget : function() {
      this.__bindAtom();
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "spacer":
          control = new qx.ui.core.Spacer();

          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.basic.Atom("");
          control.setCenter(false);
          control.setAnonymous(true);

          this._add(control, {flex:1});
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    __bindAtom : function() {
      var atom = this.getChildControl("atom");

      this.removeAllBindings();

      var labelSourcePath = this.__getBindPath(this.getLabelPath());
      this.bind(labelSourcePath, atom, "label", this.getLabelOptions());
      
      if (this.getIconPath() != null) {
        var iconSourcePath = this.__getBindPath(this.getIconPath());
        this.bind(iconSourcePath, atom, "icon", this.getIconOptions());
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySelection : function(value, old) {
      this.getChildControl("dropdown").setSelection(value);
    },


    // property apply
    _applyIconPath : function(value, old) {
      this.getChildControl("dropdown").getChildControl("list").setIconPath(value);
    },


    // property apply
    _applyIconOptions : function(value, old) {
      this.getChildControl("dropdown").getChildControl("list").setIconOptions(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    _handleMouse : function(event)
    {
      this.base(arguments, event);

      var type = event.getType();
      if (type === "click") {
        this.toggle();
      }
    },


    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },


    _onMouseOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    _getAction : function(event)
    {
      var keyIdentifier = event.getKeyIdentifier();
      var isOpen = this.getChildControl("dropdown").isVisible();

      if (!isOpen && (keyIdentifier === "Enter" || keyIdentifier === "Space")) {
        return "open";
      } else {
        return this.base(arguments, event);
      }
    },


    __getBindPath : function(path)
    {
      var bindPath = "selection[0]";

      if (path != null && path != "") {
        bindPath += "." + path;
      }

      return bindPath;
    }
  },


  destruct : function() {
    this.removeAllBindings();
  }
});
