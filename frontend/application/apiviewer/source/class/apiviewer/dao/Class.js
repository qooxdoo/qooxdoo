/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */


qx.Class.define("apiviewer.dao.Class",
{
  extend : apiviewer.dao.Node,

  construct : function(classDocNode)
  {
    this.base(arguments, classDocNode);
    this.self(arguments).registerClass(this);
  },


  statics :
  {
    _class_registry : {},
    _top_level_classes : [],

    registerClass : function(cls)
    {
      this._class_registry[cls.getFullName()] = cls;
      if (!cls._docNode.attributes.superClass) {
        this._top_level_classes.push(cls);
      }
    },

    getClassByName : function(className)
    {
      return this._class_registry[className];
    },

    getAllTopLevelClasses : function()
    {
      return this._top_level_classes;
    }

  },


  members :
  {
    getName : function()
    {
      return this._docNode.attributes.name;
    },

    getClass : function()
    {
      return this;
    },

    getFullName : function()
    {
      return this._docNode.attributes.fullName || "";
    },

    getPackageName : function()
    {
      return this._docNode.attributes.packageName || "";
    },

    getDescription : function()
    {
      return this._desc;
    },

    getType : function()
    {
      return this._docNode.attributes.type || "class";
    },

    isAbstract : function()
    {
      return this._docNode.attributes.isAbstract || false;
    },

    isStatic : function()
    {
      return this._docNode.attributes.isStatic || false;
    },

    isSingleton : function()
    {
      return this._docNode.attributes.isSingleton || false;
    },

    getSee : function()
    {
      return this._see;
    },

    getDescription : function()
    {
      return this._desc;
    },

    getSuperClass : function()
    {
      return this.self(arguments).getClassByName(this._docNode.attributes.superClass);
    },

    getChildClasses : function()
    {
      return this._docNode.attributes.childClasses ? this._docNode.attributes.childClasses.split(",") : [];
    },

    getInterfaces : function()
    {
      return this._docNode.attributes.interfaces ? this._docNode.attributes.interfaces.split(",") : [];
    },

    getMixins : function()
    {
      return this._docNode.attributes.mixins ? this._docNode.attributes.mixins.split(",") : [];
    },

    getImplementations : function()
    {
      return this._docNode.attributes.implementations ? this._docNode.attributes.implementations.split(",") : [];
    },

    getIncluder : function()
    {
      return this._docNode.attributes.includer ? this._docNode.attributes.includer.split(",") : [];
    },

    getConstructor : function()
    {
      return this._constructor;
    },

    getMembers : function()
    {
      return this._members;
    },

    getStatics : function()
    {
      return this._statics;
    },

    getEvents : function()
    {
      return this._events;
    },

    getProperties : function()
    {
      return this._properties;
    },

    getConstants : function()
    {
      return this._constants;
    },

    getAppearances : function()
    {
      return this._appearances;
    },

    getSuperInterfaces : function()
    {
      return this._superInterfaces;
    },

    getSuperMixins : function()
    {
      return this._superMixins;
    },

    /* COMPLEX FUNCTIONS */

    getClassHierarchy : function()
    {
      var result = [];
      var currentClass = this;
      while (currentClass) {
        result.push(currentClass);
        currentClass = currentClass.getSuperClass();
      }
      return result;
    },


    getItem : function(itemName)
    {
      var itemListNames = [
        "_members",
        "_statics",
        "_events",
        "_properties",
        "_constants",
        "_appearances"
      ];

      for (var i=0; i<itemListNames.length; i++)
      {
        var list = this[itemListNames[i]];
        for (var j=0; j<list.length; j++)
        {
          if (itemName == list[j].getName()) {
            return list[j];
          }
        }
      }

    },


    getItemList : function(listName)
    {
      var methodMap = {
        "events" : "_events",
        "constructor": "_constructor",
        "properties" : "_properties",
        "methods" : "_members",
        "methods-static" : "_statics",
        "constants" : "_constants",
        "appearances" : "_appearances",
        "superInterfaces" : "_superInterfaces",
        "superMixins" : "_superMixins"
      };
      if (listName == "constructor") {
        return this.getConstructor() ? [this.getConstructor()] : [];
      } else {
        return this[methodMap[listName]];
      }
    },


    getItemByListAndName : function(listName, itemName)
    {
      var list = this.getItemList(listName);
      for (var j=0; j<list.length; j++)
      {
        if (itemName == list[j].getName()) {
          return list[j];
        }
      }
    },


    getClassAppearance : function()
    {
      for (var i=0; i<this._appearances.length; i++)
      {
        if (this._appearances[i].getType() == this)
        {
          return this._appearances[i];
        }
      }
      return null;
    },


    /**
     * Returns a list of all interfaces the class implements directly.
     *
     * @param classNode {Map} The class documentation node to get the interfaces of
     * @param includeSuperClasses {Boolean?false} Whether the interfaces of all
     *   super classes should be returned as well.
     */
    getAllInterfaces : function(includeSuperClasses)
    {
      if (includeSuperClasses) {
        var docTree = apiviewer.Viewer.instance.getDocTree();
        var classNodes = this.getClassHierarchy();
      } else {
        classNodes = [this];
      }

      var interfaceNodes = [];

      for (var classIndex=0; classIndex<classNodes.length; classIndex++)
      {
        var classNode = classNodes[classIndex];

        var ifaceRecurser = function(ifaceName) {
          ifaceNode = apiviewer.dao.Class.getClassByName(ifaceName);
          interfaceNodes.push(ifaceNode);

          var superIfaces = ifaceNode.getSuperInterfaces();
          for (var i=0; i<superIfaces.length; i++) {
            ifaceRecurser(superIfaces[i].getName());
          }
        }

        var interfaces = classNode.getInterfaces();
        for (var i=0; i<interfaces.length; i++) {
          ifaceRecurser(interfaces[i]);
        }

      }
      return interfaceNodes;
    },


    _initializeFields : function()
    {
      this._members = [];
      this._statics =  [];
      this._events =  [];
      this._properties = [];
      this._constants = [];
      this._appearances = [];
      this._desc = "";
      this._see = [];
      this._superInterfaces = [];
      this._superMixins = [];
    },


    _addChildNode : function(childNode)
    {
      switch (childNode.type) {
        case "constructor" :
          this._constructor = new apiviewer.dao.Method(childNode.children[0], this, childNode.type);
          break;
        case "methods" :
          this._members = this._createNodeList(childNode, apiviewer.dao.Method, this, childNode.type);
          break;
        case "methods-static" :
          this._statics = this._createNodeList(childNode, apiviewer.dao.Method, this, childNode.type);
          break;
        case "events" :
          this._events = this._createNodeList(childNode, apiviewer.dao.Event, this, childNode.type);
          break;
        case "properties" :
          this._properties = this._createNodeList(childNode, apiviewer.dao.Properties, this, childNode.type);
          break;
        case "constants" :
          this._constants = this._createNodeList(childNode, apiviewer.dao.Constant, this, childNode.type);
          break;
        case "appearances" :
          this._appearances = this._createNodeList(childNode, apiviewer.dao.Appearance, this, childNode.type);
          break;
        case "superInterfaces" :
          this._superInterfaces = this._createNodeList(childNode, apiviewer.dao.ClassItem, this, childNode.type);
          break;
        case "superMixins" :
          this._superMixins = this._createNodeList(childNode, apiviewer.dao.ClassItem, this, childNode.type);
          break;
        case "desc":
          this._desc = childNode.attributes.text || "";
          break;
        case "see":
          this._see.push(childNode.attributes.name);
          break;
        default:
          return this.base(arguments, childNode);
      }
      return true;
    }

  }
});