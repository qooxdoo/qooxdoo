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
        '.qxconsole .messages .level-debug{background:white}',
        '.qxconsole .messages .level-info{background:#DEEDFA}',
        '.qxconsole .messages .level-warn{background:#FFF7D5}',
        '.qxconsole .messages .level-error{background:#FFE2D5}',
        '.qxconsole .messages .level-user{background:#E3EFE9}',
        '.qxconsole .messages .type-string{color:black;font-weight:normal;}',
        '.qxconsole .messages .type-number{color:#155791;font-weight:normal;}',
        '.qxconsole .messages .type-boolean{color:#15BC91;font-weight:normal;}',
        '.qxconsole .messages .type-array{color:#CC3E8A;font-weight:bold;}',
        '.qxconsole .messages .type-map{color:#CC3E8A;font-weight:bold;}',
        '.qxconsole .messages .type-class{color:#5F3E8A;font-weight:bold}',
        '.qxconsole .messages .type-instance{color:#565656;font-weight:bold}',
        '.qxconsole .messages .type-stringify{color:#565656;font-weight:bold}',
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
      var main = wrapper.firstChild;
      document.body.appendChild(wrapper.firstChild);

      // Make important DOM nodes available
      this.__main = main;
      this.__log = main.childNodes[1];
      this.__cmd = main.childNodes[2].firstChild;

      // Correct height of messages frame
      this.__onResize();

      // Register to keyboard events
      this.__initEvents();

      // Hide initially
      this.toggle();

      // Finally register to log engine
      qx.log2.Logger.register(this);
    },

    dispose : function()
    {
      qx.log2.Logger.unregister(this);
    },

    process : function(entry)
    {
      // Append new content
      this.__log.appendChild(this.__toHtml(entry));

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
      if (this.__main.style.display == "none")
      {
        this.__main.style.display = "block";
        this.__log.scrollTop = this.__log.scrollHeight;
      }
      else
      {
        this.__main.style.display = "none";
      }
    },

    __history : [],

    execute : function()
    {
      var value = this.__cmd.value;
      if (value == "") {
        return;
      }

      this.__history.push(value);
      qx.log2.Logger.debug(">>> " + value)

      var ret = qx.lang.Function.globalEval(value);
      if (ret !== undefined) {
        qx.log2.Logger.debug(ret);
      }
    },

    __onResize : function()
    {
      this.__log.style.height = (this.__main.offsetHeight - this.__main.firstChild.offsetHeight - this.__main.lastChild.offsetHeight - 2) + "px";
    },

    __onKeyPress : function(e)
    {
      if (e.getKeyIdentifier() == "Q" && e.isCtrlPressed())
      {
        this.toggle();
        e.preventDefault();
      }

      if (e.getKeyIdentifier() == "F7")
      {
        this.toggle();
        e.preventDefault();
      }

      if (e.getKeyIdentifier() == "Enter" && this.__cmd.value != "")
      {
        this.execute();
        this.__cmd.value = "";
      }
    },

    __initEvents : function()
    {
      qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyPress, this);

    },

    __toHtml : function(result)
    {
      var output = [];
      var entry, msg, sub, list;

      output.push("<span class='offset'>" + this.__formatOffset(result.offset) + "</span> ");

      var items = result.items;
      for (var i=0, il=items.length; i<il; i++)
      {
        entry = items[i];
        msg = entry.text;

        if (msg instanceof Array)
        {
          var list = [];
          for (var j=0, jl=msg.length; j<jl; j++)
          {
            sub = msg[j];
            list.push("<span class='type-" + sub.type + "'>" + sub.text + "</span>");
          }

          output.push("<span class='type-" + entry.type + "'>");

          if (entry.type === "map") {
            output.push("{", list.join(", "), "}");
          } else {
            output.push("[", list.join(", "), "]");
          }

          output.push("</span>");
        }
        else
        {
          output.push("<span class='type-" + entry.type + "'>" + msg + "</span> ");
        }
      }

      var wrapper = document.createElement("DIV");
      wrapper.innerHTML = output.join("");
      wrapper.className = "level-" + result.level;

      return wrapper;
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
