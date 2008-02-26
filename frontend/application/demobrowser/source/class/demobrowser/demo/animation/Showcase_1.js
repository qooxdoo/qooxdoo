/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */



/**
 * qx.fx offers low level animation capabilites for DOM elements.
 */
qx.Class.define("demobrowser.demo.animation.Showcase_1",
{
  extend : demobrowser.Demo,
  include : [ qx.legacy.application.MGuiCompat ],

  members :
  {

    _toggleEnable : function()
    {
      var status = (this._vBoxes[0].getEnabled() === false);

      for (var i=0, l=this._vBoxes.length; i<l; i++) {
        this._vBoxes[i].setEnabled(status);
      }
    },

    main : function()
    {
      this.base(arguments);
      this.compat();

      /* Demo elements */
      this._demoElement = document.getElementById("testDiv");
      this._demoImage = document.getElementById("testImg");

      var doc = qx.legacy.ui.core.ClientDocument.getInstance();
      this._vBoxes = [];

      /* UI elements: */
      var main = new qx.legacy.ui.layout.VerticalBoxLayout();
      main.setPadding(10);
      main.setWidth(140);

      var groupBoxes = {
        gbxBase : new qx.legacy.ui.groupbox.GroupBox("Base effects"),
        gbxAttention : new qx.legacy.ui.groupbox.GroupBox("Attention effects"),
        gbxVanish : new qx.legacy.ui.groupbox.GroupBox("Vanish effects")
      };

      var vbxBase = this.test = new qx.legacy.ui.layout.VerticalBoxLayout();
      vbxBase.set({
        spacing : 5,
        minWidth : 120
      });
      this._vBoxes.push(vbxBase);

      var btnOpacity = new qx.legacy.ui.form.Button("Toggle Opacity");
      var btnDimensions = new qx.legacy.ui.form.Button("Toggle Size");
      var btnPosition = new qx.legacy.ui.form.Button("Toggle Position");
      var btnBackground = new qx.legacy.ui.form.Button("Toggle Background");

      vbxBase.add(btnOpacity, btnDimensions, btnPosition, btnBackground);
      groupBoxes.gbxBase.add(vbxBase);


      var vbxAttention = new qx.legacy.ui.layout.VerticalBoxLayout();
      vbxAttention.set({
        spacing : 5,
        minWidth : 120
      });
      this._vBoxes.push(vbxAttention);

      var btnShake = new qx.legacy.ui.form.Button("Shake");
      var btnColorFlow = new qx.legacy.ui.form.Button("ColorFlow");
      var btnPulsate = new qx.legacy.ui.form.Button("Pulsate");
      var btnFold = new qx.legacy.ui.form.Button("Fold");
      vbxAttention.add(btnShake, btnColorFlow, btnPulsate, btnFold);
      groupBoxes.gbxAttention.add(vbxAttention);


      var vbxVanish = new qx.legacy.ui.layout.VerticalBoxLayout();
      vbxVanish.set({
        spacing : 5,
        minWidth : 120
      });
      this._vBoxes.push(vbxVanish);

      var btnPuff = new qx.legacy.ui.form.Button("Puff");
      var btnDrop = new qx.legacy.ui.form.Button("Drop out");
      var btnSwitchOff = new qx.legacy.ui.form.Button("Switch Off");
      vbxVanish.add(btnPuff, btnDrop, btnSwitchOff);
      groupBoxes.gbxVanish.add(vbxVanish);

      for(var box in groupBoxes)
      {
        groupBoxes[box].setDimension("auto", "auto");
        main.add(groupBoxes[box]);
      }

      doc.add(main)


      /* Effects: */

      var fadeToggle = new qx.fx.effect.core.Fade(this._demoElement);

      fadeToggle.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      fadeToggle.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnOpacity.addListener("execute", function(){
        var status = qx.bom.element.Style.get(this._demoElement, "display");
        fadeToggle.set({
          from : (status == "block") ? 1 : 0,
          to   : (status == "block") ? 0 : 1
        });
        fadeToggle.start();
      }, this);



      var dimensionsToggle = new qx.fx.effect.core.Scale(this._demoImage);

      dimensionsToggle.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      dimensionsToggle.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnDimensions.addListener("execute", function(){
        var status = qx.bom.element.Dimension.getWidth(this._demoImage);
        dimensionsToggle.set({
          scaleTo  : ((status > 240) ? 80 : 120),
          duration : 0.5
        });
        dimensionsToggle.start();
      }, this);



      var positionToggle = new qx.fx.effect.core.Move(this._demoElement);

      positionToggle.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      positionToggle.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnPosition.addListener("execute", function(){
        var status = qx.bom.element.Location.getLeft(this._demoElement);
        positionToggle.set({
          duration   : 1,
          x          : (status < 300) ? 300 : -300,
          y          : (status < 300) ? 100 : -100,
          transition : "spring"
        });
        positionToggle.start();
      }, this);



      var backgroundToggle = new qx.fx.effect.core.Highlight(this._demoElement);

      backgroundToggle.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      backgroundToggle.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnBackground.addListener("execute", function(){
        var status = qx.util.ColorUtil.cssStringToRgb(qx.bom.element.Style.get(this._demoElement, "backgroundColor")).toString();

        backgroundToggle.set({
          startColor        : (status == "19,66,117") ? "#134275" : "#7CFC00",
          endColor          : (status == "19,66,117") ? "#7CFC00" : "#134275",
          restoreBackground : false
        });
        backgroundToggle.start();
      }, this);



      var shake = new qx.fx.effect.combination.Shake(this._demoElement);

      shake.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      shake.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnShake.addListener("execute", function(){
        shake.start();
      });



      var colorFlow = new qx.fx.effect.combination.ColorFlow(this._demoElement);

      colorFlow.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      colorFlow.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnColorFlow.addListener("execute", function(){
        var status = qx.util.ColorUtil.cssStringToRgb(qx.bom.element.Style.get(this._demoElement, "backgroundColor")).toString();

        colorFlow.set({
          startColor : (status == "19,66,117") ? "#134275" : "#7CFC00",
          endColor   : (status == "19,66,117") ? "#7CFC00" : "#134275"
        });
        colorFlow.start();
      }, this);



      var pulsate = new qx.fx.effect.combination.Pulsate(this._demoElement);

      pulsate.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      pulsate.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnPulsate.addListener("execute", function(){
        pulsate.start();
      });



      var puff = new qx.fx.effect.combination.Puff(this._demoImage);
      puff.setModifyDisplay(false);
      
      var puffBtnNotifier;
      var vanishEffect = puff;

      btnPuff.addListener("insertDom", function(){
        puffBtnNotifier = new qx.fx.effect.combination.ColorFlow(this.getElement());
        puffBtnNotifier.set({
          startColor   : "#EBE9ED",
          endColor     : "#FFA823",
          duration     : 2,
          delayBetween : 1
        });
      });

      puff.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      puff.addListener("finish", function(){
        this._toggleEnable();

        if(btnPuff.getLabel() == "Puff")
        {
          btnPuff.setLabel("Shrink");
          vanishEffect = shrink;
        }
        else
        {
          btnPuff.setLabel("Puff");
          vanishEffect = puff;
        }

        puffBtnNotifier.start();
      }, this);

      btnPuff.addListener("execute", function(){
        vanishEffect.start();
      });

      
      
      var shrink = new qx.fx.effect.combination.Shrink(this._demoImage);
      shrink.setModifyDisplay(false);

      shrink.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      shrink.addListener("finish", function(){
        this._toggleEnable();

        if(btnPuff.getLabel() == "Puff")
        {
          btnPuff.setLabel("Shrink");
          vanishEffect = shrink;
        }
        else
        {
          btnPuff.setLabel("Puff");
          vanishEffect = puff;
        }

        puffBtnNotifier.start();
      }, this);




      var drop = new qx.fx.effect.combination.Drop(this._demoElement);
      drop.set({
        direction : "south",
        yAmount : 90
      });

      var dropBtnNotifier;

      btnDrop.addListener("insertDom", function(){
        dropBtnNotifier = new qx.fx.effect.combination.ColorFlow(this.getElement());
        dropBtnNotifier.set({
          startColor   : "#EBE9ED",
          endColor     : "#FFA823",
          duration     : 2,
          delayBetween : 1
        });
      });


      drop.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      drop.addListener("finish", function(){
        this._toggleEnable();

        if(btnDrop.getLabel() == "Drop out")
        {
          btnDrop.setLabel("Drop in");
          drop.setMode("in");
        }
        else
        {
          btnDrop.setLabel("Drop out");
          drop.setMode("out");
        }

        dropBtnNotifier.start();
      }, this);

      btnDrop.addListener("execute", function(){
        drop.start();
      });



      var fold = new qx.fx.effect.combination.Fold(this._demoElement);
      fold.setModifyDisplay(false);

      fold.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      fold.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnFold.addListener("execute", function(){
        fold.start();
      });



      var switchoff = new qx.fx.effect.combination.Switch(this._demoElement);
      switchoff.setModifyDisplay(false);

      switchoff.addListener("setup", function(){
        this._toggleEnable();
      }, this);

      switchoff.addListener("finish", function(){
        this._toggleEnable();
      }, this);

      btnSwitchOff.addListener("execute", function(){
        switchoff.start();
      });




    }

  }

});
