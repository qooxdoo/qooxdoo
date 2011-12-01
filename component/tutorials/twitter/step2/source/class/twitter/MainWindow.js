qx.Class.define("twitter.MainWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "twitter", "twitter/t_small-c.png");

    // hide the window buttons
    this.setShowClose(false);
    this.setShowMaximize(false);
    this.setShowMinimize(false);

    // adjust size
    this.setWidth(250);
    this.setHeight(300);

    // add the layout
    var layout = new qx.ui.layout.Grid(0, 0);
    layout.setRowFlex(1, 1);
    layout.setColumnFlex(0, 1);
    this.setLayout(layout);
    this.setContentPadding(0);

    // toolbar
    var toolbar = new qx.ui.toolbar.ToolBar();
    this.add(toolbar, {row: 0, column: 0, colSpan: 2});

    // reload button
    var reloadButton = new qx.ui.toolbar.Button("Reload");
    toolbar.add(reloadButton);
    reloadButton.setToolTipText("Reload the tweets.");
    reloadButton.addListener("execute", function() {
      this.fireEvent("reload");
    }, this);

    // list
    var list = new qx.ui.form.List();
    this.add(list, {row: 1, column: 0, colSpan: 2});

    // textarea
    var textarea = new qx.ui.form.TextArea();
    this.add(textarea, {row: 2, column: 0});
    textarea.setPlaceholder("Enter your message here...");
    textarea.addListener("input", function(e) {
      var value = e.getData();
      postButton.setEnabled(value.length < 140 && value.length > 0);
    }, this);

    // post button
    var postButton = new qx.ui.form.Button("Post");
    this.add(postButton, {row: 2, column: 1});
    postButton.setToolTipText("Post this message on twitter.");
    postButton.addListener("execute", function() {
      this.fireDataEvent("post", textarea.getValue());
    }, this);
    postButton.setWidth(60);
    postButton.setEnabled(false);
  },


  events :
  {
    "reload" : "qx.event.type.Event",
    "post" : "qx.event.type.Data"
  }
});
