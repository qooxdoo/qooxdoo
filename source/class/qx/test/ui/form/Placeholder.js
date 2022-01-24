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
qx.Class.define("qx.test.ui.form.Placeholder", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __testInit(clazz, childControlName) {
      var widget = new clazz();
      widget.setValue("affe");
      widget.setPlaceholder("aaa");
      this.getRoot().add(widget);
      this.flush();

      this.assertEquals(
        "affe",
        this.__getVisibleValueOf(widget),
        "placeholder visible"
      );

      this.assertEquals("affe", widget.getValue(), "Wrong value returned.");
      this.assertFalse(this.__isPlaceholderVisible(widget));
      widget.destroy();

      widget = new clazz();
      widget.setPlaceholder("abc");
      this.getRoot().add(widget);

      // sync the appearance
      this.__syncAppearance(widget);

      this.assertTrue(this.__isPlaceholderVisible(widget));
      this.assertEquals(
        "abc",
        this.__getPlaceholderValueOf(widget),
        "placeholder not visible"
      );

      this.assertNull(widget.getValue(), "Wrong value returned.");

      // get rid of the widget
      widget.destroy();
    },

    __testChangeValue(clazz) {
      var widget = new clazz();
      widget.setPlaceholder("abc");
      this.getRoot().add(widget);

      // set a value
      widget.setValue("def");
      this.assertEquals("def", widget.getValue(), "wrong value");
      this.assertEquals(
        "def",
        this.__getVisibleValueOf(widget),
        "wrong visible value"
      );

      this.assertFalse(this.__isPlaceholderVisible(widget));

      // remove the value
      widget.resetValue();

      // sync the appearance
      this.__syncAppearance(widget);

      this.assertNull(widget.getValue(), "wrong value");
      this.assertTrue(this.__isPlaceholderVisible(widget));
      this.assertEquals(
        "abc",
        this.__getPlaceholderValueOf(widget),
        "wrong visible value"
      );

      // get rid of the widget
      widget.destroy();
    },

    __testFocus(clazz) {
      var widget = new clazz();
      widget.setPlaceholder("abc");
      this.getRoot().add(widget);

      // test focus in
      widget.focus();
      this.flush();
      this.assertEquals(
        "",
        this.__getVisibleValueOf(widget),
        "wrong visible value after focus"
      );

      this.assertFalse(this.__isPlaceholderVisible(widget), "1");

      // test focus out
      this.getRoot().focus();
      this.flush();

      window.setTimeout(
        function () {
          this.resume(function () {
            this.getRoot().focus();
            this.flush();
            this.assertTrue(this.__isPlaceholderVisible(widget), "2");
            this.assertEquals(
              "abc",
              this.__getPlaceholderValueOf(widget),
              "wrong visible value after blur"
            );

            // get rid of the widget
            widget.destroy();
          }, this);
        }.bind(this),
        500
      );

      this.wait();
    },

    __testRemovePlaceholder(clazz) {
      var widget = new clazz();
      widget.setPlaceholder("abc");
      widget.setPlaceholder(null);
      this.assertFalse(this.__isPlaceholderVisible(widget));
      this.assertNull(widget.getValue(), "wrong value");
      this.assertEquals(
        "",
        this.__getVisibleValueOf(widget),
        "wrong visible value after focus"
      );

      // get rid of the widget
      widget.destroy();
    },

    __testDisabled(clazz) {
      var widget = new clazz();
      this.getRoot().add(widget);
      widget.setPlaceholder("abc");

      widget.setEnabled(false);
      this.flush();

      this.assertNull(widget.getValue(), "wrong value");
      this.assertFalse(this.__isPlaceholderVisible(widget));
      this.assertEquals(
        "",
        this.__getVisibleValueOf(widget),
        "wrong visible value"
      );

      widget.setEnabled(true);

      // sync the appearance
      this.__syncAppearance(widget);

      this.assertNull(widget.getValue(), "wrong value");
      this.assertTrue(this.__isPlaceholderVisible(widget));
      this.assertEquals(
        "abc",
        this.__getPlaceholderValueOf(widget),
        "wrong visible value"
      );

      // get rid of the widget
      widget.destroy();
    },

    __hasTextfieldChildControl(widget) {
      return (
        qx.Class.isSubClassOf(widget.constructor, qx.ui.form.ComboBox) ||
        qx.Class.isSubClassOf(widget.constructor, qx.ui.form.DateField)
      );
    },

    __syncAppearance(widget) {
      if (qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)) {
        widget.syncAppearance();
      } else if (this.__hasTextfieldChildControl(widget)) {
        widget.getChildControl("textfield").syncAppearance();
      }
    },

    __getVisibleValueOf(widget) {
      if (qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)) {
        return widget.getContentElement().getValue();
      } else if (this.__hasTextfieldChildControl(widget)) {
        return widget
          .getChildControl("textfield")
          .getContentElement()
          .getValue();
      }
    },

    __getPlaceholderValueOf(widget) {
      var useQxPlaceholder = !qx.core.Environment.get("css.placeholder");

      if (!useQxPlaceholder) {
        if (
          qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)
        ) {
          return widget.getContentElement().getAttribute("placeholder");
        } else if (this.__hasTextfieldChildControl(widget)) {
          return widget
            .getChildControl("textfield")
            .getContentElement()
            .getAttribute("placeholder");
        }
      } else {
        if (
          qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)
        ) {
          return widget._getPlaceholderElement().getValue();
        } else if (this.__hasTextfieldChildControl(widget)) {
          return widget
            .getChildControl("textfield")
            ._getPlaceholderElement()
            .getValue();
        }
      }
    },

    __isPlaceholderVisible(widget) {
      var useQxPlaceholder = !qx.core.Environment.get("css.placeholder");

      if (!useQxPlaceholder) {
        var contentElem;
        if (
          qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)
        ) {
          contentElem = widget.getContentElement();
          return (
            (widget.getValue() == null || widget.getValue() == "") &&
            contentElem.getAttribute("placeholder") != "" &&
            contentElem.getAttribute("placeholder") != null &&
            !qx.ui.core.FocusHandler.getInstance().isFocused(widget)
          );
        } else if (this.__hasTextfieldChildControl(widget)) {
          contentElem = widget.getChildControl("textfield").getContentElement();
          return (
            (widget.getChildControl("textfield").getValue() == null ||
              widget.getChildControl("textfield").getValue() == "") &&
            contentElem.getAttribute("placeholder") != "" &&
            contentElem.getAttribute("placeholder") != null &&
            !qx.ui.core.FocusHandler.getInstance().isFocused(widget)
          );
        }
      } else {
        if (
          qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)
        ) {
          return (
            widget._getPlaceholderElement().getStyle("visibility") != "hidden"
          );
        } else if (this.__hasTextfieldChildControl(widget)) {
          return (
            widget
              .getChildControl("textfield")
              ._getPlaceholderElement()
              .getStyle("visibility") != "hidden"
          );
        }
      }
    },

    /////////// TextField ///////////
    testInitTextField() {
      this.__testInit(qx.ui.form.TextField);
    },

    testChangeValueTextField() {
      this.__testChangeValue(qx.ui.form.TextField);
    },

    testFocusTextField() {
      this.__testFocus(qx.ui.form.TextField);
    },

    testRemovePlaceholderTextField() {
      this.__testRemovePlaceholder(qx.ui.form.TextField);
    },

    testDisabledTextField() {
      this.__testDisabled(qx.ui.form.TextField);
    },

    /////////// TextArea ///////////
    testInitTextArea() {
      this.__testInit(qx.ui.form.TextArea);
    },

    testChangeValueTextArea() {
      this.__testChangeValue(qx.ui.form.TextArea);
    },

    testFocusTextArea() {
      this.__testFocus(qx.ui.form.TextArea);
    },

    testRemovePlaceholderTextArea() {
      this.__testRemovePlaceholder(qx.ui.form.TextArea);
    },

    testDisabledTextArea() {
      this.__testDisabled(qx.ui.form.TextArea);
    },

    /////////// PasswordField ///////////
    testInitPasswordField() {
      this.__testInit(qx.ui.form.PasswordField);
    },

    testChangeValuePasswordField() {
      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9
      ) {
        this.skip("Skipped in IE 8 until bug #8424 is fixed.");
      }
      this.__testChangeValue(qx.ui.form.PasswordField);
    },

    testFocusPasswordField() {
      this.__testFocus(qx.ui.form.PasswordField);
    },

    testRemovePlaceholderPasswordField() {
      this.__testRemovePlaceholder(qx.ui.form.PasswordField);
    },

    testDisabledPasswordField() {
      this.__testDisabled(qx.ui.form.PasswordField);
    },

    /////////// ComboBox ///////////
    testInitComboBox() {
      this.__testInit(qx.ui.form.ComboBox);
    },

    testChangeValueComboBox() {
      this.__testChangeValue(qx.ui.form.ComboBox);
    },

    testFocusComboBox() {
      this.__testFocus(qx.ui.form.ComboBox);
    },

    testRemovePlaceholderComboBox() {
      this.__testRemovePlaceholder(qx.ui.form.ComboBox);
    },

    testDisabledComboBox() {
      this.__testDisabled(qx.ui.form.ComboBox);
    },

    /////////// DateField ///////////
    testFocusDateField() {
      this.__testFocus(qx.ui.form.DateField);
    },

    testRemovePlaceholderDateField() {
      this.__testRemovePlaceholder(qx.ui.form.DateField);
    },

    testDisabledDateField() {
      this.__testDisabled(qx.ui.form.DateField);
    }
  }
});
