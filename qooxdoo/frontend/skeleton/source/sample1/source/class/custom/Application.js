/**
 * Sample 1
 */
qx.OO.defineClass("custom.Application", qx.core.Object,
function () {
        
    // create button
    var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "icon/16/reload.png");

    // set button location
    button1.setTop(48);
    button1.setLeft(20);
       
    // add button to document
    button1.addToDocument();

    //***************************************************************************
    
    // current
    var d = qx.core.Init.getComponent().getClientWindow().getClientDocument();
    
    //proposed 1    
    qx.ui.core.ClientDocument.add(button1);
});
