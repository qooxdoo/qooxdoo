/**
 * Tags are small UI widgets that are used to show that something has been
 * "tagged", for example in `qx.ui.form.CheckedSelectBox` if you turn on
 * multiple checkboxes in the drop down list, the results bar (ie the bit
 * which remains on screen even when the list is hidden) has a series of
 * tags, one for each of the checked items.
 */
qx.Class.define("qx.ui.form.Tag", {
  extend: qx.ui.basic.Atom,

  properties: {
    appearance: {
      refine: true,
      init: "tag"
    },

    center: {
      refine: true,
      init: false
    },

    anonymous: {
      refine: true,
      init: true
    },

    model: {
      init: null,
      nullable: true,
      event: "changeModel"
    }
  },

  members: {}
});
