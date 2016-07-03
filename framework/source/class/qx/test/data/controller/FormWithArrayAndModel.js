/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Martijn Evers, The Netherlands

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */

/**
 * @ignore(qx.test.data.controller.fixture.ArrayField)
 */

qx.Class.define("qx.test.data.controller.FormWithArrayAndModel",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /** @type {qx.test.data.controller.fixture.ArrayField} */
    __arrayField : null,

    /** @type {qx.ui.form.Form} */
    __form : null,

    /** @type {qx.core.Object} */
    __model : null,


    setUp : function() {

      // imagine me being a table like widget containing two columns
      qx.Class.define("qx.test.data.controller.fixture.ArrayField", {
        extend : qx.ui.core.Widget,
        implement : [ qx.ui.form.IArrayForm, qx.ui.form.IForm ],
        include : [ qx.ui.form.MForm ],

        events : {
          changeValue : "qx.event.type.Data"
        },

        members : {
          /** @type {qx.data.Array|null} */
          __value : null,

          /**
           * @param value {qx.data.Array|null}
           * @returns void
           */
          setValue : function(value) {
            var oldValue = this.__value;
            this.__value = value;
            this.fireDataEvent("changeValue", value, oldValue);
          },

          /**
           * @returns {qx.data.Array|null}
           */
          getValue : function() {return this.__value;},

          /**
           * @returns void
           */
          resetValue : function() {this.__value = null;}
        }
      });

      this.__arrayField = new qx.test.data.controller.fixture.ArrayField();

      this.__form = new qx.ui.form.Form();
      this.__form.add(this.__arrayField, "One", null, "f1");

      this.__model = qx.data.marshal.Json.createModel({f1: null, f2: null});
    },


    tearDown : function() {
      this._disposeObjects("__arrayField", "__form", "__model");
      qx.Class.undefine("qx.test.data.controller.fixture.ArrayField");
    },


    "test self update" : function() {
      var arr = qx.data.marshal.Json.createModel([{c1: "1a1", c2: "1a2"}, {c1: "1b1", c2: "1b2"}]);
      arr.setAutoDisposeItems(true);
      this.__arrayField.setValue(arr);

      // sync form and model, model (null) takes preference over form (arr)
      var ctrl = new qx.data.controller.Form(this.__model, this.__form, true);
      this.assertNull(this.__arrayField.getValue());
      this.assertNull(this.__model.getF1());

      // user changes field and hits ok button
      this.__arrayField.setValue(arr);
      ctrl.updateModel();

      this.assertIdentical(arr, this.__model.getF1());
      ctrl.dispose();
      arr.dispose();
    },


    "test updating view" : function() {
      var arr = qx.data.marshal.Json.createModel([{c1: "2a1", c2: "2a2"}, {c1: "2b1", c2: "2b2"}]);
      arr.setAutoDisposeItems(true);
      this.__arrayField.setValue(arr);

      // sync form and model, model (null) takes preference over form (arr)
      var ctrl = new qx.data.controller.Form(this.__model, this.__form);
      this.assertNull(this.__arrayField.getValue());
      this.assertNull(this.__model.getF1());

      // user changes field and hits ok button
      this.__arrayField.setValue(arr);

      this.assertIdentical(arr, this.__model.getF1());
      ctrl.dispose();
      arr.dispose();
    },


    "test updating model" : function() {
      var arr = qx.data.marshal.Json.createModel([{c1: "2a1", c2: "2a2"}, {c1: "2b1", c2: "2b2"}]);
      arr.setAutoDisposeItems(true);

      var ctrl = new qx.data.controller.Form(this.__model, this.__form);

      // change model, view should follow
      this.__model.setF1(arr);

      this.assertIdentical(arr, this.__arrayField.getValue());
      ctrl.dispose();
      arr.dispose();
    }
  }
});
