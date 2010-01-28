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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/22/emotes/*)
************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.BuddyModel",
{
  extend : qx.core.Object,
  include : qx.data.marshal.MEventBubbling,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    name :
    {
      init : "(unnamed)",
      event : "changeName",
      check : "String",
      apply : "_applyEventPropagation"
    },

    avatar :
    {
      init : "icon/22/emotes/face-smile.png",
      event : "changeAvatar",
      check : "String",
      apply : "_applyEventPropagation"
    },

    status :
    {
      init : "offline",
      event : "changeStatus",
      check : ["away", "busy", "online", "offline"],
      apply : "_applyEventPropagation"
    },

    group :
    {
      init : "Friends",
      event : "changeGroup",
      check : "String",
      apply : "_applyEventPropagation"
    }
  },


  statics :
  {
    createBuddies : function(amount)
    {
      var users = [
        {
          name : "Alexander Back",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Fabian Jakobs",
          img : "demobrowser/demo/icons/imicons/fabian_jakobs.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Andreas Ecker",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Martin Wittemann",
          img : "demobrowser/demo/icons/imicons/martin_wittemann.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Thomas Herchenröder",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Daniel Wagner",
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Jonathan Weiß",
          img : "demobrowser/demo/icons/imicons/jonathan_weiss.png",
          statusIcon : this.getRandomStatus()
        },
        {
          name : "Christian Schmidt",
          img : "demobrowser/demo/icons/imicons/christian_schmidt.png",
          statusIcon : this.getRandomStatus()
        }
      ];

      for (var i=0; i<users.length; i++) {
        users[i].group = "qooxdoo";
      };

      // Fill with dummy users:
      for (var i=users.length; i<amount; i++) {
        users[i] = {
          name : "User #" + i,
          img : this.getRandomBuddy(),
          statusIcon : this.getRandomStatus(),
          group : "Friends"
        };
      }

      var model = [];
      for (var i=0; i<users.length; i++)
      {
        var buddyModel = new demobrowser.demo.virtual.messenger.BuddyModel().set({
          name : users[i].name,
          avatar : users[i].img,
          status : users[i].statusIcon,
          group : users[i].group
        });

        model.push(buddyModel);
      }

      return new qx.data.Array(model);
    },


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
    }
  }

});