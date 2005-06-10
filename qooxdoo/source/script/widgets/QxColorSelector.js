function QxColorSelector()
{
  QxWindow.call(this, "Color Selector", "icons/16/colors.png");

  // Hack: Force classname    
  this.classname = "QxWindow";
  
  this.setShowStatusbar(false);
  this.setShowMaximize(false);
  this.setShowMinimize(false);
  this.setResizeable(false);
  this.setUsePreferredWidthAsMin(false);
  this.setUsePreferredHeightAsMin(false);
  
  this.getPane().setPadding(8);
  
  this.setWidth(515);
  this.setHeight(400);
  


  
/*
  -------------------------------------------------------------------------------
    FIELDS
  -------------------------------------------------------------------------------
*/  
 
  var vField;
  var vArr = QxColorSelector.presets;
  var vArrLength = vArr.length;
  var vSubArr;
  var vSubArrLength;
  
  for (var i=0; i<vArrLength; i++)
  {
    vSubArr = vArr[i];
    vSubArrLength = vSubArr.length;
    
    for (var j=0; j<vSubArrLength; j++)
    {
      vField = new QxWidget;
      
      vField.setBorder(QxBorder.presets.inset);
      vField.setBackgroundColor(vSubArr[j]);
      
      vField.setWidth(20);
      vField.setHeight(16);
      
      vField.setLeft(j * 24);        
      vField.setTop(i * 20);
      
      vField.addEventListener("click", this._onpaletteclick, this);
      
      this.add(vField);
    };     
  };
  
  



/*
  -------------------------------------------------------------------------------
    HUE/SATURATION
  -------------------------------------------------------------------------------
*/
  
  var hueFrame = new QxWidget;
  
  hueFrame.setBorder(QxBorder.presets.inset);
  hueFrame.setLeft(200);
  hueFrame.setTop(0);
  hueFrame.setWidth(258);
  hueFrame.setHeight(258);
  
  var hue = this._hueArea = new QxImage("core/huesaturation.jpg", 256, 256);
  hueFrame.add(hue);
  
  var hueOpaque = this._hueOpaque = new QxWidget();
  hueOpaque.setLeft(0);
  hueOpaque.setTop(0);
  hueOpaque.setRight(0);
  hueOpaque.setBottom(0);
  hueOpaque.setBackgroundColor("black");
  
  hueFrame.add(hueOpaque);
  
  var huePos = this._huePos = new QxImage("core/huesaturationhandle.gif", 11, 11);
  
  huePos.setLeft(196);
  huePos.setTop(-4);
  
  this.add(hueFrame, huePos);
  
  hue.addEventListener("click", this._onhueareaclick);
  hue.addEventListener("mousedown", this._onhueareamousedown);
  hue.addEventListener("mouseup", this._onhueareamouseup);
  hue.addEventListener("mousemove", this._onhueareamousemove);
  
  hueOpaque.addEventListener("click", this._onhueareaclick, hue);
  hueOpaque.addEventListener("mousedown", this._onhueareamousedown, hue);
  hueOpaque.addEventListener("mouseup", this._onhueareamouseup, hue);
  hueOpaque.addEventListener("mousemove", this._onhueareamousemove, hue);  
  
  huePos.addEventListener("click", this._onhueareaclick, hue);
  huePos.addEventListener("mousedown", this._onhueareamousedown, hue);
  huePos.addEventListener("mouseup", this._onhueareamouseup, hue);
  huePos.addEventListener("mousemove", this._onhueareamousemove, hue);
  
  
  
  
/*
  -------------------------------------------------------------------------------
    BRIGHTNESS
  -------------------------------------------------------------------------------
*/  
  
  var brightFrame = new QxWidget;
  
  brightFrame.setBorder(QxBorder.presets.inset);
  brightFrame.setLeft(470);
  brightFrame.setTop(0);
  brightFrame.setWidth(21);
  brightFrame.setHeight(258);
      
  var bright = this._brightArea = new QxImage("core/brightness.jpg", 19, 256);
  brightFrame.add(bright);
  
  var brightPos = this._brightPos = new QxImage("core/brightnesshandle.gif", 35, 11);
  
  brightPos.setLeft(463);
  brightPos.setTop(-4);
  
  this.add(brightFrame, brightPos);
  
  bright.addEventListener("click", this._onbrightareaclick);
  bright.addEventListener("mousedown", this._onbrightareamousedown);
  bright.addEventListener("mouseup", this._onbrightareamouseup);
  bright.addEventListener("mousemove", this._onbrightareamousemove);

  brightPos.addEventListener("click", this._onbrightareaclick, bright);
  brightPos.addEventListener("mousedown", this._onbrightareamousedown, bright);
  brightPos.addEventListener("mouseup", this._onbrightareamouseup, bright);
  brightPos.addEventListener("mousemove", this._onbrightareamousemove, bright);
  
    
  



/*
  -------------------------------------------------------------------------------
    INPUT AREA
  -------------------------------------------------------------------------------
*/
  
  var inputArea = new QxWidget;
  
  inputArea.setLeft(0);
  inputArea.setWidth(190);
  inputArea.setTop(130);
  inputArea.setHeight(130);
  
  this.add(inputArea);
  
  
/*
  -------------------------------------------------------------------------------
    RGB FIELDS
  -------------------------------------------------------------------------------
*/

  var r = this._red = new QxSpinner(0, 0, 255);
  
  r.setLeft(143);
  r.setWidth(45);
  r.setTop(0);
  r.addEventListener("change", this._onchange, this);
  
  var rl = new QxAtom("Rot:");
  
  rl.setLeft(113);
  rl.setTop(5);
  
  
  var g = this._green = new QxSpinner(0, 0, 255);
  
  g.setLeft(143);
  g.setWidth(45);
  g.setTop(30);
  g.addEventListener("change", this._onchange, this);

  var gl = new QxAtom("Grün:");
  
  gl.setLeft(113);
  gl.setTop(35);



  var b = this._blue = new QxSpinner(0, 0, 255);
  
  b.setLeft(143);
  b.setWidth(45);
  b.setTop(60);
  b.addEventListener("change", this._onchange, this);
  
  var bl = new QxAtom("Blau:");
  
  bl.setLeft(113);
  bl.setTop(65);

  
  
  
  
/*
  -------------------------------------------------------------------------------
    HSB FIELDS
  -------------------------------------------------------------------------------
*/  
  
  var h = this._hue = new QxSpinner(0, 0, 360);
  
  h.setLeft(54);
  h.setWidth(45);
  h.setTop(0);
  h.addEventListener("change", this._onchange, this);
  
  var hl = new QxAtom("Farbton:");
  
  hl.setLeft(0);
  hl.setTop(5);    
  
  
  var s = this._sat = new QxSpinner(0, 0, 100);
  
  s.setLeft(54);
  s.setWidth(45);
  s.setTop(30);
  s.addEventListener("change", this._onchange, this);
  
  var sl = new QxAtom("Sättigung:");
  
  sl.setLeft(0);
  sl.setTop(35);
      

  var l = this._lum = new QxSpinner(0, 0, 100);
  
  l.setLeft(54);
  l.setWidth(45);
  l.setTop(60);    
  l.addEventListener("change", this._onchange, this);
  
  var ll = new QxAtom("Helligkeit:");
  
  ll.setLeft(0);
  ll.setTop(65);
  
  inputArea.add(r, rl, g, gl, b, bl, h, hl, s, sl, l, ll);
  
  
  
  
  

/*
  -------------------------------------------------------------------------------
    HEX FIELD
  -------------------------------------------------------------------------------
*/

  var hexLabel = new QxAtom("Hexadezimal: #");
  
  hexLabel.setLeft(55);
  hexLabel.setTop(110);

  var hex = this._hex = new QxTextField;
  
  hex.setLeft(132);
  hex.setTop(106);
  hex.setWidth(55);
  
  inputArea.add(hexLabel, hex);
  
  hex.addEventListener("changeText", this._onchangehex, this);
  
  
  
/*
  -------------------------------------------------------------------------------
    STATE PRESENTATION
  -------------------------------------------------------------------------------
*/  

  var savedColor = this._savedColor = new QxAtom("Aktuelle Farbe");
  
  savedColor.setTop(270);
  savedColor.setLeft(200);
  savedColor.setWidth(125);
  savedColor.setHeight(25);
  savedColor.setHorizontalBlockAlign("center");
  savedColor.setBorder(QxBorder.presets.inset);

  
  var newColor = this._newColor = new QxAtom("Neue Farbe");
  
  newColor.setTop(270);
  newColor.setRight(33);
  newColor.setWidth(125);
  newColor.setHeight(25);
  newColor.setHorizontalBlockAlign("center");
  newColor.setBorder(QxBorder.presets.inset);
  

  
  
  this.add(savedColor, newColor);
  
  
  
  
/*
  -------------------------------------------------------------------------------
    SEPARATOR
  -------------------------------------------------------------------------------
*/ 

  var sep = new QxWidget;
  
  sep.setHeight(2);
  sep.setBorder(QxBorder.presets.thinInset);
  sep.setWidth("100%");
  sep.setLeft(0);
  sep.setTop(325);
  
  this.add(sep);
  
  
  
/*
  -------------------------------------------------------------------------------
    BUTTONS
  -------------------------------------------------------------------------------
*/
  
  var btncancel = this._btncancel = new QxButton("Cancel", "icons/16/button_cancel.png", 16, 16);
  var btnok = this._btnok = new QxButton("OK", "icons/16/button_ok.png", 16, 16);
  
  btncancel.setRight(0);
  btncancel.setTop(335);
  btncancel.setWidth(85);
  btncancel.setHorizontalBlockAlign("center");
  
  btnok.setRight(95);
  btnok.setTop(335);
  btnok.setWidth(85);
  btnok.setHorizontalBlockAlign("center");
  
  
  this.add(btncancel, btnok);  
};

QxColorSelector.extend(QxWindow, "QxColorSelector");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxColorSelector.addProperty({ name : "currentColor", type : QxColor });
QxColorSelector.addProperty({ name : "enableShader", type : Boolean, defaultValue : true });




/*
  -------------------------------------------------------------------------------
    DATA
  -------------------------------------------------------------------------------
*/

QxColorSelector.presets = 
[
  [[255,128,128], [255,255,128], [128,255,128], [0,155,128],   [128,255,255], [0,128,255],   [255,128,192], [255,128,255]],
  [[255,0,0],     [255,255,0],   [128,255,0],   [0,255,64],    [0,255,255],   [0,128,192],   [128,128,192], [255,0,255]  ],
  [[128,64,64],   [255,128,64],  [0,255,0],     [0,128,128],   [0,64,128],    [128,128,255], [128,0,64],    [255,0,128]  ],
  [[128,0,0],     [255,128,0],   [0,128,0],     [0,128,64],    [0,0,255],     [0,160,160],   [128,0,128],   [128,0,255]  ],
  [[64,0,0],      [128,64,0],    [0,64,0],      [0,64,64],     [0,0,128],     [0,0,64],      [64,0,64],     [64,0,128]   ],
  [[0,0,0],       [128,128,0],   [128,128,64],  [128,128,128], [64,128,128],  [192,192,192], [32,0,32],     [255,255,255]]
];

proto._mode = null;




/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyCurrentColor = function(propValue, propOldValue, propName, uniqModIds)
{
  this._newColor.setBackgroundColor(propValue, uniqModIds);    
  
  var r = QxColor.read(propValue);
  
  if (this._mode != "rgb")
  {    
    this._red.setValue(r[0]);
    this._green.setValue(r[1]);
    this._blue.setValue(r[2]);
  };
  
  var c = QxColor.RGB2HSB(r[0], r[1], r[2]);
  
  this._newColor.setColor(this._useWhiteColor(c) ? "white" : "black");
  
  if (this._mode != "hsb" && this._mode != "lum")
  {
    if (this._mode != "brightarea")
    {
      this._hue.setValue(c[0]);
      this._sat.setValue(c[1]);
    };
    
    if (this._mode != "huearea")
    {
      this._lum.setValue(c[2]);
    };
  };
  
  if (this._mode != "huearea" && this._mode != "brightarea")
  {
    // range: 
    // x: 196 to 452
    // y: -4 to to 252
    if (this._mode != "lum")
    {
      this._huePos.setLeft(196+(c[0]/3.6*2.56));
      this._huePos.setTop(256 - (-4+(c[1]*2.56)));
    };

    // range:
    // y: -4 to 252
  
    if (this._mode != "hsb")
    {
      this._brightPos.setTop(-4+256-(c[2]*2.56));
    };
  };
  
  if (this.getEnableShader() && this._mode != "huearea")
  {
    this._hueOpaque.setOpacity(1 - (c[2] / 100));
  };
  
  if (this._mode != "hex")
  {
    var s = "";
    
    s += QxColor.m_hex[Math.floor(r[0]/16)] + QxColor.m_hex[r[0]%16];
    s += QxColor.m_hex[Math.floor(r[1]/16)] + QxColor.m_hex[r[1]%16];
    s += QxColor.m_hex[Math.floor(r[2]/16)] + QxColor.m_hex[r[2]%16];
    
    this._hex.setText(s);
  };
  
  return true;
};

proto._modifyEnableShader = function(propValue, propOldValue, propName, uniqModIds)
{
  propValue ? this.add(this._hueOpaque) : this.remove(this._hueOpaque);
  return true;
};

proto._useWhiteColor = function(v) {
  return v[2] < 70 || (v[1] > 50 && (v[0].inrange(200, 280) || v[0].inrange(-1, 40)));
};

proto.setSavedColor = function(propValue)
{
  var r = QxColor.read(propValue);
  
  if (r)
  {
    var c = QxColor.RGB2HSB(r[0], r[1], r[2]);

    this._savedColor.setBackgroundColor(propValue);    
    this._savedColor.setColor(this._useWhiteColor(c) ? "white" : "black");
  }
  else
  {
    this._savedColor.setBackgroundColor(null);    
    this._savedColor.setColor("black");
  };
};


/*
  -------------------------------------------------------------------------------
    EVENTS: TEXT FIELDS
  -------------------------------------------------------------------------------
*/

proto._onchange = function(e)
{
  if (isValidString(this._mode)) {
    return;
  };
  
  var t = e.getTarget();
  
  switch(e.getTarget())
  {
    case this._red:
    case this._blue:
    case this._green:
      this._mode = "rgb";
      this.setCurrentColor([this._red.getValue(), this._green.getValue(), this._blue.getValue()]);
      break;      
    
    case this._lum:
      this._mode = "lum";
      this.setCurrentColor(QxColor.HSB2RGB(this._hue.getValue(), this._sat.getValue(), this._lum.getValue()));
      break;

    case this._hue:
    case this._sat:
      this._mode = "hsb";
      this.setCurrentColor(QxColor.HSB2RGB(this._hue.getValue(), this._sat.getValue(), this._lum.getValue()));
      break;     
  };
  
  delete this._mode;
};


proto._onchangehex = function(e)
{
  if (isValidString(this._mode)) {
    return;
  };
  
  this._mode = "hex";
  
  var r = QxColor.read("#" + this._hex.getText());
  
  if (r) {
    this.setCurrentColor(r);
  };
  
  delete this._mode;
};



/*
  -------------------------------------------------------------------------------
    EVENTS: PALETTE 
  -------------------------------------------------------------------------------
*/

proto._onpaletteclick = function(e)
{
  this._mode = "palette";
  
  this.setCurrentColor(e.getTarget().getBackgroundColor());    
  
  delete this._mode;
};




/*
  -------------------------------------------------------------------------------
    EVENTS: HUE AREA
  -------------------------------------------------------------------------------
*/

proto._hueActive = false;

proto._onhueareamousedown = function(e)
{
  this._hueActive = true;
  this.setCapture(true);
};

proto._onhueareamouseup = function(e)
{
  this._hueActive = false;
  this.setCapture(false);
};

proto._onhueareamousemove = function(e)
{
  if (this._hueActive) {
    var pa = this.getParent().getParent().getParent();
    pa._onhueareaclick.call(this, e);
  };
};

proto._onhueareaclick = function(e)
{
  var pa = this.getParent().getParent().getParent();
  
  var h = ((e.getPageX() - this.getComputedPageBoxLeft()) / 2.56 * 3.6).limit(0, 360);
  var s = ((e.getPageY() - this.getComputedPageBoxTop()) / 2.56).limit(0, 100);
  var b = pa._lum.getValue();   

  pa._huePos.setLeft(196+(h/3.6*2.56));
  pa._huePos.setTop(-4+(s*2.56));  
  
  pa._mode = "huearea";
  
  try 
  {
    var r = QxColor.HSB2RGB(h, 100 - s, b);
    if (isValidArray(r)) {
      pa.setCurrentColor(r);
    };
  }
  catch(ex) {};
  
  delete pa._mode;  
};






/*
  -------------------------------------------------------------------------------
    EVENTS: BRIGHTNESS AREA 
  -------------------------------------------------------------------------------
*/

proto._brightActive = false;

proto._onbrightareamousedown = function(e)
{
  this._brightActive = true;
  this.setCapture(true);
};

proto._onbrightareamouseup = function(e)
{
  this._brightActive = false;
  this.setCapture(false);
};

proto._onbrightareamousemove = function(e)
{
  if (this._brightActive) {
    var pa = this.getParent().getParent().getParent();
    pa._onbrightareaclick.call(this, e);
  }; 
};

proto._onbrightareaclick = function(e)
{
  var pa = this.getParent().getParent().getParent();
  
  var h = pa._hue.getValue();
  var s = pa._sat.getValue();
  var b = ((e.getPageY() - this.getComputedPageBoxTop()) / 2.56).limit(0, 100);

  pa._brightPos.setTop(-4+(b*2.56));  
  
  pa._mode = "brightarea";
  
  try 
  {
    var r = QxColor.HSB2RGB(h, s, 100 - b);
    if (r) {
      pa.setCurrentColor(r);
    };
  }
  catch(ex) {};
  
  delete pa._mode; 
};





/*
  -------------------------------------------------------------------------------
    DISPOSE
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  
  
  
  return QxWindow.prototype.dispose.call(this);
};