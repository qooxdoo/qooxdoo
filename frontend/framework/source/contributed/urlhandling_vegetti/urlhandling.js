getSiteUrl = function()
{
   var result;
   var params;
   var index;

   result = document.location.protocol + "//" + document.location.host
+ document.location.pathname;
   while (result.charAt(result.length - 1) != "/")
   {
       result = result.substring(0, result.length - 1);
   }
   result = result.substring(0, result.length - 1);
   return result;
}

getParam = function(name, alternativeUrl)
{
   var params;
   var index;
   var result;

   if ((endodedUrl === undefined) || (endodedUrl === null))
   {
     params = document.location.search.substring(1,
document.location.search.length);
   }
   else
   {
       params = alternativeUrl.split("?")[1];
   }
   params = params.split("&");
   result = "";
   for (index = 0; index < params.length; index++)
   {
       var parts;

       parts = params[index].split("=");
       if (parts[0] == name)
       {
           result = parts[1];
           break;
       }
   }
   return result;
}