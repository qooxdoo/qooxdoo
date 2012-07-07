/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Mixin.define("widgetbrowser.MControls",
{

  members:
  {

    initControls: function(widgets, options)
    {
      options = options || {};

      var controls = new qx.ui.container.Composite;
      controls.setLayout(new qx.ui.layout.HBox(10));
      this.add(controls);

      if (options.disabled) {
        var toggleDisabled = new qx.ui.form.ToggleButton("Disabled");
        toggleDisabled.addListener("changeValue", function() {
          widgets.forEach(function(widget, index) {
            if (widget.setEnabled) {
              widget.setEnabled(!this.getValue());
            }
          }, this);
        });
        controls.add(toggleDisabled);
      }

      if (options.hovered) {
        var toggleHovered = new qx.ui.form.ToggleButton("Hovered");
        toggleHovered.addListener("changeValue", function() {
          widgets.forEach(function(widget, index) {
            if (this.getValue()) {
              widget.addState("hovered");
            } else {
              widget.removeState("hovered");
            }
          }, this);
        });
        controls.add(toggleHovered);
      }

      if (options.selected) {
        var toggleSelected = new qx.ui.form.ToggleButton("Selected");
        toggleSelected.addListener("changeValue", function() {
          widgets.forEach(function(widget, index) {
            if (this.getValue()) {
              widget.addState("selected");
            } else {
              widget.removeState("selected");
            }
          }, this);
        });
        controls.add(toggleSelected);
      }

      if (options.focused) {
        var toggleFocused = new qx.ui.form.ToggleButton("Focused");
        toggleFocused.addListener("changeValue", function(e) {
          widgets.forEach(function(widget, index) {
            if (this.getValue()) {
              widget.addState("focused");
            } else {
              widget.removeState("focused");
            }
          }, this);
        });
        controls.add(toggleFocused);
      }

      if (options.invalid) {
        var toggleInvalid = new qx.ui.form.ToggleButton("Invalid");
        toggleInvalid.addListener("changeValue", function(e) {
          widgets.forEach(function(widget, index) {
            if (widget.setInvalidMessage && widget.setValid) {
              widget.setInvalidMessage("This is invalid message number " + index + ".");
              widget.setValid(!this.getValue());
            }
          }, this);
        });
        controls.add(toggleInvalid);
      }

      if (options.overflow) {
        var toggleInvalid = new qx.ui.form.ToggleButton("Overflow");
        toggleInvalid.addListener("changeValue", function(e) {
          widgets.forEach(function(widget, index) {
            widget.toggleOverflow(widget, e.getData());
          }, this);
        });
        controls.add(toggleInvalid);
      }

      if (options.hidesome) {
        var tb = new qx.ui.form.ToggleButton("Hide some");
        tb.addListener("changeValue", function(e) {
          widgets.forEach(function(widget, index) {
            if (widget.canHide) {
              e.getData() ? widget.exclude() : widget.show();
            }
          }, this);
        });
        controls.add(tb);
      }

    }
  }
});