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

/**
* qx.fx.Transition contains mathematical functions for non-linear transitions in effects.
*/
qx.Class.define("demobrowser.demo.animation.Transition_Color",
{
extend : qx.application.Standalone,

members :
{
 main: function()
 {
   this.base(arguments);

   var doc = this.getRoot();

   var elementStyle = 'font-size:12pt;text-align:center;font-family:"Trebuchet MS","Lucida Grande",Verdana,sans-serif;color:white;left:90px;top:90px;position:absolute;width:200px;height:55px;border:2px #E5E5E5 solid;background-color:#134275;z-Index:2;';
   myElement = qx.bom.Element.create('div', { style : elementStyle });

   document.body.appendChild(myElement);

   myElement.id = "testDiv";
   myElement.innerHTML = 'Welcome to <br><b style="color:#F3FFB3;">qooxdoo</b> animations!';

   var transitionData = {
     linear      : "Linear is the default transition for many effects.",
     easeInQuad  : "EaseInQuad will accelerate exponentially.",
     easeOutQuad : "EaseOutQuad will slow down exponentially.",
     sinodial    : "sinodial transition will accelerate sinusoidal.",
     reverse     : "Reverse behaves like linear, but in the opposite direction.",
     wobble      : "Wobble will bounce the element forwards and backwards.",
     spring      : "Spring will overshoot the target and then move back.",
     flicker     : "Alternates rapidly between start end target. Looks only nice on color effects.",
     pulse       : "Alternates between start and end. Looks only nice on color effects."
   };


   var combo = new qx.ui.form.ComboBox;
   var btnShow = new qx.ui.form.Button("Show it!");
   var lblName = new qx.ui.basic.Label("Name");
   var lblDesc = new qx.ui.basic.Label("Description");
   var lblDur = new qx.ui.basic.Label("Duration");
   var lblDesc =new qx.ui.basic.Label;
   var spDuration = new qx.ui.form.Spinner;

   for (var transition in transitionData) {
     combo.add(new qx.ui.form.ListItem(transition));
   }

   combo.addListener("changeValue", function(){
     lblDesc.setText(transitionData[this.getSelected().getLabel()]);
   });

   spDuration.set({
     max   : 10.0,
     min   :  0.1,
     value :  1.0
   });

   var animMove = new qx.fx.effect.core.Highlight(myElement);
   animMove.set({
     startColor : "#134275",
     endColor : "#7CFC00"
   });

   var moveBack = false;
   animMove.addListener("finish", function()
   {
     animMove.set({
       x: moveBack ? 90 : 600,
       y: moveBack ? 90 : 300
     });
     moveBack = !moveBack;
   });

   var nf = new qx.util.format.NumberFormat();
   nf.setMaximumFractionDigits(2);
   spDuration.setNumberFormat(nf);

   btnShow.addListener("execute", function(){
     var transition = combo.getValue();
     animMove.set({
       transition : transition,
       duration : spDuration.getValue()
     });

     animMove.start();
   });

   doc.add(lblName, {left : 25, top : 50});
   doc.add(lblDesc, {left : 25, top : 75});
   doc.add(lblDur, {left : 25, top : 25});
   doc.add(combo, {left : 90, top : 50});
   doc.add(lblDesc, {left : 90, top : 75});
   doc.add(spDuration, {left : 90, top : 25});
   doc.add(btnShow, {left : 23, top : 100});

 }
}
});
