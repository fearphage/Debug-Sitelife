/*
 * foo
 */
FBL.ns(function() { with (FBL) {

/*
if (typeof FBTrace == 'undefined')
    FBTrace = {sysout: function() {}};

*/
Firebug.SiteLifeModel = extend(Firebug.Module, {
  dispatchName: 'DebugSiteLife.INTERNAL'  
  ,initialize: function(owner) {
    Firebug.Module.initialize.apply(this, arguments);
    
    FBTrace.sysout('init DebugSiteLife');
    // Register JSON Viewer listener
    Firebug.JSONViewerModel.addListener(JSONListener);
  }

  ,shutdown: function() {
    Firebug.Module.shutdown.apply(this, arguments);
    
    FBTrace.sysout('shutdown DebugSiteLife');
    // Unregister JSON Viewer listener
    Firebug.JSONViewerModel.removeListener(JSONListener);
  }
  
  ,onParseJSON: function(file) {
    // Perhaps somebody else already parsed the response.
    if (file.jsonObject)
      return;
    
    var contentType = file.request.contentType
        ,sitelifePath = safeGetPath(file)
        ,sitelifeMatch = /^\/ver1\.0\/direct\/(process|jsonp)$/.exec(sitelifePath);
    
    //if (FBTrace.DBG_JSONVIEWER)
      FBTrace.sysout('contentType: ' + contentType + '; sitelifePath: ' + sitelifePath + '; matched? ' + (!!sitelifeMatch));
      
    // Parse response if the URL is as expected.
    
    if (sitelifeMatch) {
      var json2Parse = file.responseText, jsonMatch;
      // if jsonp
      if ((sitelifePath.indexOf('/jsonp') > -1) && (jsonMatch = json2Parse.match(/\((.+)\);$/))) {
        json2Parse = jsonMatch[1];
      }
      else if ((sitelifePath.indexOf('/process') > -1) && (jsonMatch = json2Parse.split('</script>'))) {
        //if (FBTrace.DBG_JSONVIEWER)
          FBTrace.sysout(jsonMatch[1]);
        
        json2Parse = decodeURIComponent(jsonMatch[1]);
      }
      file.jsonObject = parseJSONString(json2Parse, 'http://' + file.request.originalURI.host);
    }
  }
});
var JSONListener = {
dispatchName: 'DebugSiteLife.EXTERN'
,onParseJSON: function(file) {
    // Perhaps somebody else already parsed the response.
    if (file.jsonObject)
      return;
    
    var contentType = file.request.contentType
        ,sitelifePath = safeGetPath(file)
        ,sitelifeMatch = /^\/ver1\.0\/direct\/(process|jsonp)$/.exec(sitelifePath);
    
    if (FBTrace.DBG_JSONVIEWER)
      FBTrace.sysout('contentType: ' + contentType + '; sitelifePath: ' + sitelifePath + '; matched? ' + (!!sitelifeMatch));
      
    // Parse response if the URL is as expected.
    
    if (sitelifeMatch) {
      var json2Parse = file.responseText, jsonMatch;
      // if jsonp
      if ((sitelifePath.indexOf('/jsonp') > -1) && (jsonMatch = json2Parse.match(/\((.+)\);$/))) {
        json2Parse = jsonMatch[1];
      }
      else if ((sitelifePath.indexOf('/process') > -1) && (jsonMatch = json2Parse.split('</script>'))) {
        if (FBTrace.DBG_JSONVIEWER)
          FBTrace.sysout(jsonMatch[1]);
        
        json2Parse = decodeURIComponent(jsonMatch[1]);
      }
      file.jsonObject = parseJSONString(json2Parse, 'http://' + file.request.originalURI.host);
    }
  }
};
function safeGetPath(file) {
  try {
    return String(file.request.originalURI.path).toLowerCase().split('?')[0];
  }
  catch (ignore) { }
  return null;
}

//Firebug.registerModule(Firebug.SiteLifeModel);
}});