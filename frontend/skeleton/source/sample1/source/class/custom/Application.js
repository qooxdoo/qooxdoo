/**
 * Sample 1
 */
qx.OO.defineClass("custom.Application", qx.core.Object,
function () {

    // create button
    var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "icon/16/reload.png");

    // set button location
    button1.setTop(50);
    button1.setLeft(50);

    // add button to document (needs implementation)
    // button1.addToDocument();

    //***************************************************************************

    // current
    var d = qx.core.Init.getComponent().getClientWindow().getClientDocument();
    d.add(button1);

    // proposed 1 (needs implementation)
    // qx.ui.core.ClientDocument.add(button1);
});
