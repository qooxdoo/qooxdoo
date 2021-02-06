/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */

/**
 * @ignore(qx.test.data.controller.fixture.ArrayField, qx.test.data.controller.fixture.ModelField)
 */

qx.Class.define("qx.test.data.controller.FormWithArrayAndModel",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /** @type {qx.test.data.controller.fixture.ArrayField} */
    __arrayField : null,

    /** @type {qx.test.data.controller.fixture.ModelField} */
    __modelField : null,

    /** @type {qx.ui.form.Form} */
    __form : null,

    /** @type {qx.core.Object} */
    __model : null,


    setUp : function() {

      // imagine me being a table like widget containing two columns (e.g. an miniature todo-list)
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
           */
          setValue : function(value) {
            var oldValue = this.__value;
            this.__value = value;
            this.fireDataEvent("changeValue", value, oldValue);
          },

          /**
           * @return {qx.data.Array|null}
           */
          getValue : function() {return this.__value;},

          resetValue : function() {this.__value = null;}
        }
      });

      // imagine me being a multi-field widget (e.g. address form embedded in user form)
      qx.Class.define("qx.test.data.controller.fixture.ModelField", {
        extend : qx.data.controller.Form,
        implement : [ qx.ui.form.IArrayForm, qx.ui.form.IForm ],
        include : [ qx.ui.form.MForm ],

        events : {
          changeValue : "qx.event.type.Data",

          // implement IForm interface
          changeEnabled : "qx.event.type.Data"
        },

        members : {
          // implement IForm interface
          setEnabled : function() {},
          getEnabled : function() {return true;},

          /**
           * @param value {qx.core.Object|null}
           */
          setValue : function(value) {
            this.setModel(value);
          },

          /**
           * @return {qx.core.Object|null}
           */
          getValue : function() {return this.getModel();},

          resetValue : function() { this.resetModel(); },

          // overwritten
          _applyModel : function(value, old) {
            this.base(arguments, value, old);
            this.fireDataEvent("changeValue", value, old);
          }
        }
      });

      this.__arrayField = new qx.test.data.controller.fixture.ArrayField();
      this.__modelField = new qx.test.data.controller.fixture.ModelField();

      this.__form = new qx.ui.form.Form();
      this.__form.add(this.__arrayField, "One", null, "f1");
      this.__form.add(this.__modelField, "Two", null, "f2");

      this.__model = qx.data.marshal.Json.createModel({f1: null, f2: null, f3: null});
    },


    tearDown : function() {
      this._disposeObjects("__arrayField", "__modelField", "__form", "__model");
      qx.Class.undefine("qx.test.data.controller.fixture.ArrayField");
      qx.Class.undefine("qx.test.data.controller.fixture.ModelField");
    },


    /**
     * Reusable address form.
     *
     * @return {qx.ui.form.Form} Address form.
     */
    __makeAddressForm : function() {
      var houseNr = new qx.ui.form.TextField();
      var streetName = new qx.ui.form.TextField();
      var addressForm = new qx.ui.form.Form();
      addressForm.add(houseNr, "houseNr");
      addressForm.add(streetName, "streetName");
      qx.util.DisposeUtil.disposeTriggeredBy(houseNr, addressForm);
      qx.util.DisposeUtil.disposeTriggeredBy(streetName, addressForm);
      return addressForm;
    },


    "test self update: array" : function() {
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


    "test self update: model" : function() {
      var addressForm = this.__makeAddressForm();
      this.__modelField.setTarget(addressForm);

      var ctrl = new qx.data.controller.Form(this.__model, this.__form, true);
      this.assertNull(this.__arrayField.getValue());
      this.assertNull(this.__modelField.getValue());

      // let's make an address for this user (this.__model being a user now ;) )
      this.__modelField.createModel(false);
      addressForm.getItem("houseNr").setValue("42");
      addressForm.getItem("streetName").setValue("Nowhere Ln");
      ctrl.updateModel();

      // imagine f2 now being a user address
      this.assertIdentical("42", this.__model.getF2().getHouseNr());
      this.assertIdentical("Nowhere Ln", this.__model.getF2().getStreetName());
      ctrl.dispose();
      addressForm.dispose();
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


    "test updating model: array field" : function() {
      var arr = qx.data.marshal.Json.createModel([{c1: "2a1", c2: "2a2"}, {c1: "2b1", c2: "2b2"}]);
      arr.setAutoDisposeItems(true);

      var ctrl = new qx.data.controller.Form(this.__model, this.__form);

      // change model, view should follow
      this.__model.setF1(arr);

      this.assertIdentical(arr, this.__arrayField.getValue());
      ctrl.dispose();
      arr.dispose();
    },


    "test updating model: model field" : function() {
      var addressForm = this.__makeAddressForm();
      this.__modelField.setTarget(addressForm);

      var ctrl = new qx.data.controller.Form(this.__model, this.__form);
      this.assertNull(this.__arrayField.getValue());
      this.assertNull(this.__modelField.getValue());

      this.__modelField.createModel(false);
      this.assertIdentical(this.__modelField.getModel(), this.__model.getF2());

      ctrl.dispose();
      addressForm.dispose();
    }
  }
});
