
qx.Class.define("qxunit.runner.ProgressBar",
{
  extend : qx.ui.layout.CanvasLayout,

  construct : function()
  {
    this.base(arguments);
    this.set({
      height : 20,
      width  : 200,
      backgroundColor : "#C1ECFF",
      border : "inset"
    });


    this.bar = new qx.ui.basic.Terminator();
    this.add(this.bar);
    this.bar.set({
      height : 16,
      width  : 120,
      //left   : 0,
      backgroundColor: "#0000FF"
    });

  }, //construct

  members: {
    update: function(val) {
      if(val = "5/12") {
        //handle curr/total spec
      } else if (val = "54%") {
        //handle percent spec
      } else {
        //throw invalid update spec exception
      }
    }//update
  },//members

  properties: {
    status: {type: "integer", _legacy: true}
  }

});
/*
Setter of property 'backgroundColor' returned with an error: Error - Could not parse color: C1ECFF 
*/
