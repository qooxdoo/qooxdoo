/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */


/* ************************************************************************

#asset(demobrowser/demo/icons/imicons/*)
#asset(qx/icon/${qx.icontheme}/22/emotes/*)

************************************************************************ */


qx.Class.define("demobrowser.demo.virtual.MessangerLayer",
{
  extend : qx.ui.virtual.layer.AbstractWidget,
  
  construct : function()
  {
    this.base(arguments);
    
    this.__users = [
      {
        name : "Alexander Back",
        img : this.getRandomBuddy()
      },
      {
        name : "Fabian Jakobs",
        img : "demobrowser/demo/icons/imicons/fabian_jakobs.png"
      },
      {
        name : "Andreas Ecker",
        img : this.getRandomBuddy()
      },
      {
        name : "Martin Wittemann",
        img : "demobrowser/demo/icons/imicons/martin_wittemann.png"
      },
      {
        name : "Thomas Herchenröder",
        img : this.getRandomBuddy()
      },
      {
        name : "Daniel Wagner",
        img : this.getRandomBuddy()
      },
      {
        name : "Jonathan Weiß",
        img : "demobrowser/demo/icons/imicons/jonathan_weiss.png"
      },
      {
        name : "Yücel Beser",
        img : this.getRandomBuddy()
      },
      {
        name : "Christian Schmidt",
        img : "demobrowser/demo/icons/imicons/christian_schmidt.png"
      }
    ];
    
    for (var i=0; i<this.__users.length; i++) {
      this.__users[i].statusIcon = this.getRandomStatus();
    }
    
    this.groupPositions = {}
    this.groupPositions[0] = true;
    this.groupPositions[this.__users.length + 1] = true;
    
    this._buddyPool = [];
    this._groupPool = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    __users : null,
    
    getRandomBuddy : function()
    {
      var icons = [
        "angel", "embarrassed", "kiss", "laugh", "plain", "raspberry",
        "sad", "smile-big", "smile", "surprise"
      ];
      return "icon/22/emotes/face-" + icons[Math.floor(Math.random() * icons.length)] + ".png";
    },
  
    getRandomStatus : function()
    {
      var icons = [
        "away", "busy", "online", "offline"           
      ];
      return icons[Math.floor(Math.random() * icons.length)];
    },

    _getWidget : function(row, column)
    {
      if (this.groupPositions[row])
      {
        return this._groupPool.pop() || new qx.ui.basic.Atom().set({
          icon: "decoration/arrows/down-invert.png",
          textColor: "white",
          font: "bold",
          padding: [0, 3]
        });
      }
    
      return this._buddyPool.pop() || new demobrowser.demo.virtual.Buddy(); 
    },

    _poolWidget: function(widget)
    {
      if (this.groupPositions[widget.getUserData("row")]) {
        this._groupPool.push(widget);
      } else {      
        this._buddyPool.push(widget)
      }
    },

    _configureWidget : function(widget, row, column)
    {
      widget.setUserData("row", row);
      widget.setUserData("column", column);

      if (this.groupPositions[row]) 
      {
        if (row == 0) {
          widget.setLabel("qooxdoo");
        } else {
          widget.setLabel("Friends");
        }       
        return;
      }
      
      if (row < this.__users.length+1)
      {
        widget.label.setContent(this.__users[row-1].name);
        widget.icon.setSource(this.__users[row-1].img);
        widget.statusIcon.setSource("demobrowser/demo/icons/imicons/status_" + this.__users[row-1].statusIcon + ".png");
      }
      else
      {
        widget.label.setContent("User #" + row);
        widget.icon.setSource("icon/22/emotes/face-smile.png");
        widget.statusIcon.setSource("demobrowser/demo/icons/imicons/status_offline.png");
      }
    }

  }
});
