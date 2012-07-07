/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("fce.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  appearances :
  {
    "listitem/checkbox" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          padding : [0, 35, 0, 0]
        };
      }
    },

    "featureselector" :
    {
    },

    "featureselector/list" :
    {
      alias : "list",
      include : "list"
    },

    "listitem/textfield" :
    {
      style : function(states)
      {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = "text";
        }

        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        }
        else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding,
          textColor : textColor,
          backgroundColor : states.disabled ? "background-disabled" : "white"
        };
      }
    },

    "featureselector/table" :
    {
      alias : "table",
      include : "table"
    },

    "featureselector/textarea" :
    {
      alias : "textarea",
      include : "textarea"
    }
  }
});