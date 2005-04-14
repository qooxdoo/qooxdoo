function QxNativeWindow()
{
  QxTarget.call(this);
  

  
};

QxNativeWindow.extend(QxTarget, "QxNativeWindow");

QxNativeWindow.addProperty({ name : "width", type : Number, defaultValue : 400 });
QxNativeWindow.addProperty({ name : "height", type : Number, defaultValue : 250 });

proto.open = function()
{
  var conf = "";
  
  if (isValidNumber(this.getWidth())) {
    conf += "width=" + this.getWidth() + ",";
  };
  
  if (isValidNumber(this.getHeight())) {
    conf += "height=" + this.getHeight() + ",";
  };
  
  this._source = (new QxImageManager).getPath() + "html/basic.html";
  
  var w = this._window = window.open(this._source, this.toHash(), conf);
  var d = this._document = w.document;
  var b = this._body = d.body;
  
  this._instance = new QxClientWindow(w);
  
  w.focus();  
  
  
  
  

};

proto.getClientWindow = function()
{
  return this._instance;
};

proto.getBody = function()
{
  return this._body;
};