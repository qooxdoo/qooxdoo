function initGui(fsm)
{
  var o;
  var d = qx.legacy.ui.core.ClientDocument.getInstance();

  var vLayout = new qx.legacy.ui.layout.VerticalBoxLayout();
  vLayout.setTop(40);
  vLayout.setLeft(20);
  vLayout.setSpacing(4);
  vLayout.setWidth(700);
  vLayout.setHeight(300);

  vLayout.add(new qx.legacy.ui.basic.Label("URL:"));
  var defaultURL = qx.io.remote.Rpc.makeServerURL();
  if (defaultURL == null)
  {
    defaultURL = "/services/";
  }
  o = new qx.legacy.ui.form.TextField(defaultURL);
  vLayout.add(o);
  fsm.addObject("text_url", o);

  vLayout.add(new qx.legacy.ui.basic.Label("Service:"));
  o = new qx.legacy.ui.form.TextField("qooxdoo.test");
  vLayout.add(o);
  fsm.addObject("text_service", o);

  vLayout.add(new qx.legacy.ui.basic.Label("Method:"));
  o = new qx.legacy.ui.form.TextField("sleep");
  vLayout.add(o);
  fsm.addObject("text_method", o);

  var hLayout = new qx.legacy.ui.layout.HorizontalBoxLayout();
  hLayout.setHeight("auto");
  hLayout.setVerticalChildrenAlign("middle");
  hLayout.setSpacing(4);

  o = new qx.legacy.ui.form.TextField("2");
  o.setWidth(200);
  hLayout.add(o);
  fsm.addObject("text_message", o);

  o = new qx.legacy.ui.form.Button("Send to server");
  o.addListener("execute", fsm.eventListener, fsm);
  hLayout.add(o);
  fsm.addObject("button_send", o);

  o = new qx.legacy.ui.form.Button("Abort");
  o.setEnabled(false);
  o.addListener("execute", fsm.eventListener, fsm);
  hLayout.add(o);
  fsm.addObject("button_abort", o);

  vLayout.add(hLayout);

  vLayout.add(new qx.legacy.ui.basic.Label("Result:"));
  o = new qx.legacy.ui.form.TextField("");
  o.setWidth(600);
  vLayout.add(o);
  fsm.addObject("text_result", o);

  var hLayout = new qx.legacy.ui.layout.HorizontalBoxLayout();
  hLayout.setHeight("auto");
  hLayout.setVerticalChildrenAlign("middle");
  hLayout.setSpacing(4);

  var o = new qx.legacy.ui.basic.Atom("Idle=blue, RPC=red");
  o.setBorder("black");
  o.setTextColor("white");
  o.setWidth(200);
  o.setHeight(30);
  o.setPadding(4);
  hLayout.add(o);
  fsm.addObject("atom_1", o, "group_color_change");

  var o = new qx.legacy.ui.basic.Atom("Idle=blue, RPC=red");
  o.setBorder("black");
  o.setTextColor("white");
  o.setWidth(200);
  o.setHeight(30);
  o.setPadding(4);
  hLayout.add(o);
  fsm.addObject("atom_2", o, "group_color_change");

  var o = new qx.legacy.ui.basic.Atom("Idle=blue, RPC=red");
  o.setBorder("black");
  o.setTextColor("white");
  o.setWidth(200);
  o.setHeight(30);
  o.setPadding(4);
  hLayout.add(o);
  fsm.addObject("atom_3", o, "group_color_change");

  vLayout.add(hLayout);

  d.add(vLayout);
}
