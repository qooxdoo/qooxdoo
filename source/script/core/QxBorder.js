/* ********************************************************************
   Class: QxBorder
******************************************************************** */

function QxBorder(bWidth, bStyle, bColor)
{
  QxTarget.call(this);

  this._props = {};
  this._widgets = {};

  this._defs = { top : "", right : "", bottom : "", left : "", topColors : "", rightColors : "", bottomColors : "", leftColors : "" };

  if (isValid(bWidth) && bWidth != 0) {
    this.setWidth(bWidth);
  };

  if (isValid(bStyle)) {
    this.setStyle(bStyle);
  };

  if (isValid(bColor)) {
    this.setColor(bColor);
  };
};

QxBorder.extend(QxTarget, "QxBorder");


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxBorder.addProperty({ name : "topWidth", type : Number, defaultValue : 0, impl : "borderTopProperty" });
QxBorder.addProperty({ name : "rightWidth", type : Number, defaultValue : 0, impl : "borderRightProperty" });
QxBorder.addProperty({ name : "bottomWidth", type : Number, defaultValue : 0, impl : "borderBottomProperty" });
QxBorder.addProperty({ name : "leftWidth", type : Number, defaultValue : 0, impl : "borderLeftProperty" });

QxBorder.addProperty({ name : "topStyle", type : String, defaultValue : "none", impl : "borderTopProperty" });
QxBorder.addProperty({ name : "rightStyle", type : String, defaultValue : "none", impl : "borderRightProperty" });
QxBorder.addProperty({ name : "bottomStyle", type : String, defaultValue : "none", impl : "borderBottomProperty" });
QxBorder.addProperty({ name : "leftStyle", type : String, defaultValue : "none", impl : "borderLeftProperty" });

QxBorder.addProperty({ name : "topColor", type : QxColor, defaultValue : "transparent", impl : "borderTopProperty" });
QxBorder.addProperty({ name : "rightColor", type : QxColor, defaultValue : "transparent", impl : "borderRightProperty" });
QxBorder.addProperty({ name : "bottomColor", type : QxColor, defaultValue : "transparent", impl : "borderBottomProperty" });
QxBorder.addProperty({ name : "leftColor", type : QxColor, defaultValue : "transparent", impl : "borderLeftProperty" });



/*
------------------------------------------------------------------------------------
  HELPER
------------------------------------------------------------------------------------
*/

QxBorder.styleDecl = { top : "borderTop", right : "borderRight", bottom : "borderBottom", left : "borderLeft" };
QxBorder.geckoColorDecl = { top : "MozBorderTopColors", right : "MozBorderRightColors", bottom : "MozBorderBottomColors", left : "MozBorderLeftColors" };



/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

QxBorder.fromString = function(s)
{
  var b = new QxBorder;
  var parts = s.split(/\s+/);
  var p;

  for (var i = 0; i < parts.length; i++)
  {
    p = parts[i];

    switch(p)
    {
      case "groove":
      case "ridge":
      case "inset":
      case "outset":
      case "solid":
      case "dotted":
      case "dashed":
      case "double":
      case "none":
        b.setStyle(p);
        break;

      default:
        var n = parseFloat(p);

        if(n == p || p.indexOf("px") != -1) {
          b.setWidth(n);
        }
        else
        {
          b.setColor(p);
        };

        break;
    };
  };

  return b;
};

if ((new QxClient).isOpera())
{
  proto._generateDefString = function(bWidth, bStyle, bColor)
  {
    var sWidth = typeof bWidth == "number" && bWidth >= 0 && bWidth < 1000 ? bWidth + "px" : "0px";
    var bStyle = typeof bStyle == "string" && bStyle != "" ? bStyle : "solid";
    var bColor = typeof bColor == "string" ? bColor : "";
    
    // Fix default border color for complex border types
    if (bColor == "")
    {
      switch(bStyle)
      {
        case "groove":
        case "ridge":
          bColor = "ThreeDHighlight";
          break;
        
        case "outset":
        case "inset":
          bColor = "ThreeDFace";
          break;
      };
    };  
  
    return sWidth + " " + bStyle + " " + (bColor != "" ? " " + bColor : "");
  };
}
else
{
  proto._generateDefString = function(bWidth, bStyle, bColor)
  {
    var sWidth = typeof bWidth == "number" && bWidth >= 0 && bWidth < 1000 ? bWidth + "px" : "0px";
    var bStyle = typeof bStyle == "string" && bStyle != "" ? bStyle : "solid";
    var bColor = typeof bColor == "string" ? bColor : "";
    
    return sWidth + " " + bStyle + " " + (bColor != "" ? " " + bColor : "");
  };
};




/*
------------------------------------------------------------------------------------
  WIDGET CONNECTION
------------------------------------------------------------------------------------
*/

/*!
Add widget to use this border
  
#param o[QxWidget]: Instanceof QxWidget
*/
proto.addWidget = function(o)
{
  this._widgets[o.toHash()] = o;
  this._applyWidget(o);
};

/*!
Remove a widget from this border
  
#param o[QxWidget]: Instanceof QxWidget
*/
proto.removeWidget = function(o)
{
  delete this._widgets[o.toHash()];
  this._resetWidget(o);
};




/*
------------------------------------------------------------------------------------
  COMBINED SETTERS
------------------------------------------------------------------------------------
*/

proto.setWidth = function(bWidth, uniqModIds)
{
  this.setTopWidth(bWidth, uniqModIds);
  this.setRightWidth(bWidth, uniqModIds);
  this.setBottomWidth(bWidth, uniqModIds);
  this.setLeftWidth(bWidth, uniqModIds);

  return true;
};

proto.setStyle = function(bStyle, uniqModIds)
{
  this.setTopStyle(bStyle, uniqModIds);
  this.setRightStyle(bStyle, uniqModIds);
  this.setBottomStyle(bStyle, uniqModIds);
  this.setLeftStyle(bStyle, uniqModIds);

  return true;
};

proto.setColor = function(bColor, uniqModIds)
{
  this.setTopColor(bColor, uniqModIds);
  this.setRightColor(bColor, uniqModIds);
  this.setBottomColor(bColor, uniqModIds);
  this.setLeftColor(bColor, uniqModIds);

  return true;
};





/*
------------------------------------------------------------------------------------
  BORDER MODIFIER AND SYNCER
------------------------------------------------------------------------------------
*/

proto._modifyBorderTopProperty = function(propValue, propOldValue, propName, uniqModIds)
{
  this._props[propName] = propValue;
  this._defs.top = this._generateDefString(this._props["topWidth"], this._props["topStyle"], this._props["topColor"]);

  this._syncGeckoBorderTop();
  this._sync("top");

  return true;
};

if ((new QxClient).isGecko())
{
  proto._syncGeckoBorderTop = function()
  {
    if (typeof this._props["topColor"] == "string" && this._props["topColor"] != "")
    {
      this._defs["topColors"] = "";
    }
    else
    {
      switch(this._props["topStyle"])
      {
        case "groove":
          this._defs["topColors"] = "ThreeDShadow ThreeDHighlight";
          break;

        case "ridge":
          this._defs["topColors"] = "ThreeDHighlight ThreeDShadow";
          break;

        case "inset":
          this._defs["topColors"] = "ThreeDShadow ThreeDDarkShadow";
          break;

        case "outset":
          this._defs["topColors"] = "ThreeDLightShadow ThreeDHighlight";
          break;

        default:
          this._defs["topColors"] = "";
      };
    };  
  };
}
else
{
  proto._syncGeckoBorderTop = function() {};    
};

proto._modifyBorderRightProperty = function(propValue, propOldValue, propName, uniqModIds)
{
  this._props[propName] = propValue;
  this._defs.right = this._generateDefString(this._props["rightWidth"], this._props["rightStyle"], this._props["rightColor"]);

  this._syncGeckoBorderRight();
  this._sync("right");

  return true;
};

if ((new QxClient).isGecko())
{
  proto._syncGeckoBorderRight = function()
  {
    if (typeof this._props["rightColor"] == "string" && this._props["rightColor"] != "")
    {
      this._defs["rightColors"] = "";
    }
    else
    {
      switch(this._props["rightStyle"])
      {
        case "groove":
          this._defs["rightColors"] = "ThreeDHighlight ThreeDShadow";
          break;

        case "ridge":
          this._defs["rightColors"] = "ThreeDShadow ThreeDHighlight";
          break;

        case "inset":
          this._defs["rightColors"] = "ThreeDHighlight ThreeDLightShadow";
          break;

        case "outset":
          this._defs["rightColors"] = "ThreeDDarkShadow ThreeDShadow";
          break;

        default:
          this._defs["rightColors"] = "";
      };
    };
  };
}
else
{
  proto._syncGeckoBorderRight = function() {};    
};

proto._modifyBorderBottomProperty = function(propValue, propOldValue, propName, uniqModIds)
{
  this._props[propName] = propValue;
  this._defs.bottom = this._generateDefString(this._props["bottomWidth"], this._props["bottomStyle"], this._props["bottomColor"]);

  this._syncGeckoBorderBottom();
  this._sync("bottom");

  return true;
};

if ((new QxClient).isGecko())
{
  proto._syncGeckoBorderBottom = function()
  {
    if (typeof this._props["bottomColor"] == "string" && this._props["bottomColor"] != "")
    {
      this._defs["bottomColors"] = "";
    }
    else
    {
      switch(this._props["bottomStyle"])
      {
        case "groove":
          this._defs["bottomColors"] = "ThreeDHighlight ThreeDShadow";
          break;

        case "ridge":
          this._defs["bottomColors"] = "ThreeDShadow ThreeDHighlight";
          break;

        case "inset":
          this._defs["bottomColors"] = "ThreeDHighlight ThreeDLightShadow";
          break;

        case "outset":
          this._defs["bottomColors"] = "ThreeDDarkShadow ThreeDShadow";
          break;

        default:
          this._defs["bottomColors"] = "";
      };
    }; 
  };
}
else
{
  proto._syncGeckoBorderBottom = function() {};    
};

proto._modifyBorderLeftProperty = function(propValue, propOldValue, propName, uniqModIds)
{
  this._props[propName] = propValue;
  this._defs.left = this._generateDefString(this._props["leftWidth"], this._props["leftStyle"], this._props["leftColor"]);

  this._syncGeckoBorderLeft();
  this._sync("left");

  return true;
};

if ((new QxClient).isGecko())
{
  proto._syncGeckoBorderLeft = function()
  {
    if (typeof this._props["leftColor"] == "string" && this._props["leftColor"] != "")
    {
      this._defs["leftColors"] = "";
    }
    else
    {
      switch(this._props["leftStyle"])
      {
        case "groove":
          this._defs["leftColors"] = "ThreeDShadow ThreeDHighlight";
          break;

        case "ridge":
          this._defs["leftColors"] = "ThreeDHighlight ThreeDShadow";
          break;

        case "inset":
          this._defs["leftColors"] = "ThreeDShadow ThreeDDarkShadow";
          break;

        case "outset":
          this._defs["leftColors"] = "ThreeDLightShadow ThreeDHighlight";
          break;

        default:
          this._defs["leftColors"] = "";
      };
    };  
  };
}
else
{
  proto._syncGeckoBorderLeft = function() {};    
};

proto._sync = function(bProp)
{
  for (i in this._widgets) {
    this._applyWidgetProp(this._widgets[i], bProp);
  };
};





/*
------------------------------------------------------------------------------------
  BORDER APPLY IMPLEMENTATION
------------------------------------------------------------------------------------
*/

if ((new QxClient).isGecko())
{
  proto._applyWidgetProp = function(o, bProp)
  {
    if (typeof o == "undefined" || o == null) {
      throw new Error("Failed to get widget to update border: " + o);
    };
  
    c = QxBorder.styleDecl;
    o.setStyleProperty(c[bProp], this._defs[bProp]);
    
    c = QxBorder.geckoColorDecl;
    o.setStyleProperty(c[bProp], this._defs[bProp + "Colors"]);  
  };  
  
  proto._applyWidget = function(o)
  {
    if (typeof o == "undefined" || o == null || (!o instanceof QxWidget)) {
      throw new Error("Failed to get widget to update border: " + o);
    };

    var c;

    with(this._defs) 
    {
      c = QxBorder.styleDecl;

      o.setStyleProperty(c.top, top);
      o.setStyleProperty(c.right, right);
      o.setStyleProperty(c.bottom, bottom);
      o.setStyleProperty(c.left, left);

      c = QxBorder.geckoColorDecl;

      o.setStyleProperty(c.top, topColors);
      o.setStyleProperty(c.right, rightColors);
      o.setStyleProperty(c.bottom, bottomColors);
      o.setStyleProperty(c.left, leftColors);
    };
  };
  
  proto._resetWidget = function(o)
  {
    var c = QxBorder.styleDecl;

    o.setStyleProperty(c.top, "");
    o.setStyleProperty(c.right, "");
    o.setStyleProperty(c.bottom, "");
    o.setStyleProperty(c.left, "");

    c = QxBorder.geckoColorDecl;

    o.setStyleProperty(c.top, "");
    o.setStyleProperty(c.right, "");
    o.setStyleProperty(c.bottom, "");
    o.setStyleProperty(c.left, "");    
  };
}
else
{
  proto._applyWidgetProp = function(o, bProp)
  {
    if (typeof o == "undefined" || o == null) {
      throw new Error("Failed to get widget to update border: " + o);
    };
  
    c = QxBorder.styleDecl;
    o.setStyleProperty(c[bProp], this._defs[bProp]);
  };  
  
  proto._applyWidget = function(o)
  {
    if (typeof o == "undefined" || o == null || (!o instanceof QxWidget)) {
      throw new Error("Failed to get widget to update border: " + o);
    };

    var c;

    with(this._defs) 
    {
      c = QxBorder.styleDecl;

      o.setStyleProperty(c.top, top);
      o.setStyleProperty(c.right, right);
      o.setStyleProperty(c.bottom, bottom);
      o.setStyleProperty(c.left, left);
    };
  };
  
  proto._resetWidget = function(o)
  {
    var c = QxBorder.styleDecl;

    o.setStyleProperty(c.top, "");
    o.setStyleProperty(c.right, "");
    o.setStyleProperty(c.bottom, "");
    o.setStyleProperty(c.left, "");
  };  
};



/*
------------------------------------------------------------------------------------
  PRESETS
------------------------------------------------------------------------------------
*/

QxBorder.presets = {
  inset : new QxBorder(2, "inset"),
  outset : new QxBorder(2, "outset"),
  groove : new QxBorder(2, "groove"),
  ridge : new QxBorder(2, "ridge"),

  thinInset : new QxBorder(1, "solid", "ThreeDShadow"),
  thinOutset : new QxBorder(1, "solid", "ThreeDShadow"),
  
  black : new QxBorder(1, "solid", "black"),
  white : new QxBorder(1, "solid", "white"),
  shadow : new QxBorder(1, "solid", "ThreeDShadow")
};

with(QxBorder.presets.thinInset) {
  setRightColor("ThreeDHighlight");
  setBottomColor("ThreeDHighlight");
};

with(QxBorder.presets.thinOutset) {
  setLeftColor("ThreeDHighlight");
  setTopColor("ThreeDHighlight");
};




/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (typeof this._widgets == "object") {
    for (var i; i<this._widgets.length; i++) {
      delete this._widgets[i];
    };
  };

  delete this._widgets;

  if (typeof this._props == "object") {
    for (var i in this._props) {
      delete this._props[i];
    };
  };

  delete this._props;

  if (typeof this._defs == "object") {
    for (var i in this._defs) {
      delete this._defs[i];
    };
  };

  delete this._defs;

  return QxTarget.prototype.dispose.call(this);
};