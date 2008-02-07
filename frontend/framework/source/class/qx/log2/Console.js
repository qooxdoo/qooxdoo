/*
#require(qx.event.handler.Window)
*/

qx.Class.define("qx.log2.Console",
{
  statics :
  {
    init : function()
    {
      // Build style sheet content
      var style = 
      [
        '.qxconsole{z-index:10000;width:500px;height:250px;top:4px;right:4px;position:absolute;border:1px solid black;color:black;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.2;}',
        '.qxconsole .control{background:#cdcdcd;border-bottom:1px solid black;padding:4px 8px;}',
        '.qxconsole .control a{text-decoration:none;color:black;}',        
        '.qxconsole .messages{background:white;height:100%;width:100%;overflow-y:scroll;}',        
        '.qxconsole .messages div{padding:0px 4px;}',                
        '.qxconsole .messages div.debug{color:black}',                        
        '.qxconsole .messages div.info{color:blue}',                        
        '.qxconsole .messages div.warn{color:orange}',                        
        '.qxconsole .messages div.error{color:red}',                                
        '.qxconsole .command{background:white;padding:2px 4px;border-top:1px solid black;}',
        '.qxconsole .command input{width:100%;border:0 none;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.2;}',
        '.qxconsole .command input:focus{outline:none;}'
      ];
      
      // Include stylesheet
      qx.bom.Stylesheet.createElement(style.join(""));
      
      // Build markup
      var markup = 
      [
        '<div class="qxconsole">',
        '<div class="control"><a href="javascript:qx.log2.Console.clear()">Clear</a> | <a href="javascript:qx.log2.Console.toggle()">Hide</a></div>',
        '<div class="messages">',
        '</div>',
        '<div class="command">',
        '<input type="text"/>',
        '</div>',
        '</div>'
      ];
      
      // Insert HTML to access DOM node
      var wrapper = document.createElement("DIV");
      wrapper.innerHTML = markup.join("");
      document.body.appendChild(wrapper);
      
      // Make important DOM nodes available
      this.__main = wrapper.firstChild;
      this.__log = this.__main.childNodes[1];
      this.__cmd = this.__main.childNodes[2].firstChild;
      
      // Correct height of messages frame
      this.__onResize();
      
      // Register to keyboard events
      this.__initEvents();
      
      // Finally register to log engine
      qx.log2.Logger.register(this);
    },
    
    dispose : function()
    {
      qx.log2.Logger.unregister(this);      
    },    
    
    process : function(entry)
    {
      var html = this.__toHtml(entry.msgs);
      var wrapper = document.createElement("div");
      
      // Append new content
      wrapper.className = entry.level;
      wrapper.innerHTML = html;
      this.__log.appendChild(wrapper);
      
      // Scroll down
      this.__log.scrollTop = this.__log.scrollHeight;      
    },
    
    clear : function()
    {
      // Remove all messages
      this.__log.innerHTML = "";
    },
    
    __visible : true,
    
    toggle : function()
    {
      this.__main.style.display = this.__visible ? "none" : "";
      this.__visible = !this.__visible;
      
      if (this.__visible) {
        this.__log.scrollTop = this.__log.scrollHeight;
      }
    },
    
    execute : function()
    {
      var value = this.__cmd.value;
      if (value == "") {
        return;
      }
      
      qx.log2.Logger.debug(">>> " + value)
      
      var ret = qx.lang.Function.globalEval(value);
      qx.log2.Logger.debug(ret);
    },
    
    __onResize : function()
    {
      this.__log.style.height = (this.__main.offsetHeight - this.__main.firstChild.offsetHeight - this.__main.lastChild.offsetHeight - 2) + "px";
    },   
    
    __onKeyPress : function(e)
    {
      if (e.getKeyIdentifier() == "Q" && e.isCtrlPressed()) {
        this.toggle();
      }
      
      if (e.getKeyIdentifier() == "Enter" && this.__cmd.value != "") {
        this.execute();
      }
    },
    
    __initEvents : function() 
    {
      qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyPress, this);
      
    },
    
    __toHtml : function(result)
    {
      var output = [];
      var entry;
      
      for (var i=0, l=result.length; i<l; i++) 
      {
        entry = result[i];
        output.push("<span class='qx" + entry.type + "'>" + entry.msg + "</span>");
      }
      
      offset = "<span class='offset'>" + this.__formatOffset(entry.offset) + "</span>: ";
      
      return offset + output.join(" ");
    },
    
    
    __formatOffset : function(offset, length)
    {
      var str = offset.toString();
      var diff = (length||8) - str.length;
      var pad = "";
      
      for (var i=0; i<diff; i++) {
        pad += "0";
      }
      
      return pad+str;
    }      
  },
  
  defer : function(statics) 
  {
    qx.event.Registration.addListener(window, "load", statics.init, statics);
    qx.event.Registration.addListener(window, "unload", statics.dispose, statics);    
  }
});
