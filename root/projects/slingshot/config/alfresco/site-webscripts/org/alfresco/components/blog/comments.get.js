model.webScriptWidgets = [];
var commentList = {};
commentList.name = "Alfresco.CommentList";
commentList.provideMessages = true;
commentList.provideOptions = true;
commentList.options = {};
commentList.options.siteId = (page.url.templateArgs.site != null) ? page.url.templateArgs.site : "";
commentList.options.containerId = template.properties.container != null ? template.properties.container : "documentLibrary";

var height = (args.editorHeight != null) ? args.editorHeight : 180,
    width = (args.editorWidth != null) ? args.editorWidth : 700,
    locale = locale.substring(0, 2);
commentList.options.height = height;
commentList.options.width = width
commentList.options.editorConfig = 
   {
      height: height,
      width: width,
      inline_styles: false,
      convert_fonts_to_spans: false,
      theme: "advanced",
      theme_advanced_buttons1: "bold,italic,underline,|,bullist,numlist,|,forecolor,|,undo,redo,removeformat",
      theme_advanced_toolbar_location: "top",
      theme_advanced_toolbar_align: "left",
      theme_advanced_statusbar_location: "bottom",
      theme_advanced_resizing: true,
      theme_advanced_buttons2: null,
      theme_advanced_buttons3: null,
      theme_advanced_path: false,
      language: locale
   }
model.webScriptWidgets.push(commentList);
