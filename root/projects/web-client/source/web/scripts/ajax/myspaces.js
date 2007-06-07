var MySpaces = {
   IMG_SMALL: 16,
   IMG_LARGE: 64,
   ANIM_LENGTH: 300,
   DETAIL_MARGIN: 56,
   TITLE_FONT_SIZE: 18,
   RESOURCE_PANEL_HEIGHT: 150,
   fileInput: null,
   Path: null,
   Filter: null,
   Home: null,
   ServiceContext: null,
   popupPanel: null,
   
   start: function()
   {
      if ($('spacePanel'))
      {
         // fire off the ajax request to populate the spaces list - the 'myspacespanel' webscript
         // is responsible for rendering just the contents of the main panel div
         YAHOO.util.Connect.asyncRequest(
            "GET",
            MySpaces.ServiceContext + '/myspacespanel?p='+MySpaces.Path+'&f='+MySpaces.Filter+'&h='+MySpaces.Home,
            {
               success: function(response)
               {
                  // push the response into the space panel div
                  $('spacePanel').setHTML(response.responseText);
                  // extract the count value from a hidden div and display it
                  $('spaceCount').setHTML($('spaceCountValue').innerHTML);
                  // wire up all the events and animations
                  MySpaces.init();
               },
               failure: function(response)
               {
                  $('spacePanel').setHTML("Sorry, data currently unavailable.");
               }
            }
         );
      }
   },
   
   init: function()
   {
      MySpaces.parseSpacePanels();
      // hide the ajax wait panel and show the main spaces panel
      $('spacePanelOverlay').setStyle('visibility', 'hidden');
      $('spacePanel').setStyle('visibility', 'visible');
   },

   /**
    * Perform the operations required to add the events and animations required to anim various
    * nodes when the user mouseovers and clicks on rows in the space panel
    */
   parseSpacePanels: function()
   {
      var spaces = $$('#spacePanel .spaceRow');
      var items = $$('#spacePanel .spaceItem');
      var infos = $$('#spacePanel .spaceInfo');
      var details = $$('#spacePanel .spaceDetail');
      var icons = $$('#spacePanel .spaceIcon');
      var imgs = $$('#spacePanel .spaceIconImage');
      var imgs64 = $$('#spacePanel .spaceIconImage64');
      var resources = $$('#spacePanel .spaceResource');
      var fxItem = new Fx.Elements(items, {wait: false, duration: MySpaces.ANIM_LENGTH, transition: Fx.Transitions.linear});
      var fxDetail = new Fx.Elements(details, {wait: false, duration: MySpaces.ANIM_LENGTH, transition: Fx.Transitions.linear});
      var fxInfo = new Fx.Elements(infos, {wait: false, duration: MySpaces.ANIM_LENGTH, transition: Fx.Transitions.linear});
      var fxIcon = new Fx.Elements(icons, {wait: false, duration: MySpaces.ANIM_LENGTH, transition: Fx.Transitions.linear});
      var fxResource = new Fx.Elements(resources,
      {
         wait: false,
         duration: 500,
         transition: Fx.Transitions.linear,
         onComplete: function()
         {
            this.elements.each(function(resource, i)
            {
               if (resource.parentNode.isOpen)
               {
                  if (resource.isLoaded)
                  {
                     resource.needsOverflow = false;
                     var elePrev = $E('.spacePreview', resource)
                     if (elePrev)
                     {
                        elePrev.setStyle('overflow', 'auto');
                     }
                  }
                  else
                  {
                     // defer style change to ajax complete event
                     resource.needsOverflow = true;
                  }
               }
            });
         }
      });
      var fxImage = new Fx.Elements(imgs,
      {
         wait: false,
         duration: MySpaces.ANIM_LENGTH,
         transition: Fx.Transitions.linear,
         onComplete: function()
         {
            this.elements.each(function(img, i)
            {
               img.src = (img.getStyle('height').toInt() == MySpaces.IMG_SMALL) ? img.defSrc : img.bigSrc;
            });
         }
      });

      spaces.each(function(space, i)
      {
         var item = items[i],
             info = infos[i],
             detail = details[i],
             img = imgs[i],
             resource = resources[i];

         // animated elements defaults
         item.defMarginLeft = item.getStyle('margin-left').toInt();
         item.defFontSize = item.getStyle('font-size').toInt();
         item.defBColor = (item.getStyle('background-color') == 'transparent') ? '' : item.getStyle('background-color');
         detail.defHeight = 1;
         detail.setStyle('opacity', 0);
         detail.setStyle('display', 'block');
         detail.setStyle('height', detail.defHeight);
         info.setStyle('opacity', 0);
         // NOTE: special check for images without special 64x64 pixel version
         if (imgs64[i].src.lastIndexOf("_default.png") != -1)
         {
            img.src = img.src.replace(new RegExp("/filetypes/.*\.png$"), "/filetypes/_default.png");
         }
         img.defSrc = img.src;
         img.bigSrc = imgs64[i].src;
         resource.defHeight = 1;
         resource.setStyle('height', resource.defHeight);
         
         // register 'mouseenter' (subclassed mouseover) event for each space
         space.addEvent('mouseenter', function(e)
         {
            var animItem = {},
               animDetail = {},
               animInfo = {};
               animImage = {};
            // highlight the item title
            space.addClass('spaceItemSelected');
            // move the item title to the right
            animItem[i] = {
               'margin-left': [item.getStyle('margin-left').toInt(), MySpaces.DETAIL_MARGIN],
               'font-size': [item.getStyle('font-size').toInt(), MySpaces.TITLE_FONT_SIZE]
            };
            // fade in the info button
            animInfo[i] = {'opacity': [info.getStyle('opacity'), 1]};
            // slide and fade in the details panel
            animDetail[i] = {
               'height': [detail.getStyle('height').toInt(), detail.defHeight + MySpaces.IMG_LARGE],
               'opacity': [detail.getStyle('opacity'), 1]
            };
            // grow the spacetype image
            animImage[i] = {
               'height': [img.getStyle('height').toInt(), MySpaces.IMG_LARGE],
               'width': [img.getStyle('width').toInt(), MySpaces.IMG_LARGE]
            };
            img.src = img.bigSrc;

            // reset styles on all other space
            spaces.each(function(otherSpace, j)
            {
               var otherItem = items[j];
               var otherInfo = infos[j];
               var otherDetail = details[j];
               var otherImg = imgs[j];
               if ((otherSpace != space) && (!otherSpace.isOpen))
               {
                  // reset selected class?
                  otherSpace.removeClass('spaceItemSelected');
                  // move the title back to the left?
                  var ml = otherItem.getStyle('margin-left').toInt();
                  if (ml != otherItem.defMarginLeft)
                  {
                     animItem[j] = {
                        'margin-left': [ml, otherItem.defMarginLeft],
                        'font-size': [otherItem.getStyle('font-size').toInt(), otherItem.defFontSize]
                     };
                  }
                  // does this space detail panel need resetting back to it's default height?
                  var h = otherDetail.getStyle('height').toInt();
                  if (h != otherDetail.defHeight)
                  {
                     animDetail[j] = {
                        'height': [h, otherDetail.defHeight],
                        'opacity': [otherDetail.getStyle('opacity'), 0]};
                  }
                  // does the info button need fading out
                  var o = otherInfo.getStyle('opacity');
                  if (o != 0)
                  {
                     animInfo[j] = {'opacity': [o, 0]};
                  }
                  // does the image need shrinking?
                  var ih = otherImg.getStyle('height').toInt();
                  if (ih != MySpaces.IMG_SMALL)
                  {
                     animImage[j] = {
                        'height': [ih, MySpaces.IMG_SMALL],
                        'width': [ih, MySpaces.IMG_SMALL]
                     };
                  }
               }
            });
            fxItem.start(animItem);
            fxDetail.start(animDetail);
            fxInfo.start(animInfo);
            fxImage.start(animImage);
         });

         space.addEvent('click', function(e)
         {
            var animItem = {},
               animDetail = {},
               animInfo = {};
               animImage = {},
               animResource = {},
               resourceHeight = resource.getStyle('height').toInt();
            
            if (!space.isOpen)
            {
               if (!resource.isLoaded)
               {
                  // fire off the ajax request to get the preview panel content and actions
                  YAHOO.util.Connect.asyncRequest(
                     "POST",
                     getContextPath() + '/ajax/invoke/NodeInfoBean.sendNodeInfo',
                     { 
                        success: function(response)
                        {
                           // remove the ajax waiting animation class
                           resource.removeClass("spacesAjaxWait");
                           // populate the resource div with the result
                           resource.innerHTML = response.responseText;
                           // flag this resource as loaded
                           resource.isLoaded = true;
                           // deferred from transition complete event
                           if (resource.needsOverflow)
                           {
                              var elePrev = $E('.spacePreview', resource)
                              if (elePrev)
                              {
                                 elePrev.setStyle('overflow', 'auto');
                              }
                           }
                        },
                        failure: function(response)
                        {
                           resource.innerHTML = "Sorry, preview currently unavailable.";
                        },
                        argument: [resource]
                     }, 
                     "noderef=" + resource.id + "&template=myspaces_preview_panel.ftl"
                  );
               }
               
               // open up this space's resources
               // flag this space as open
               space.isOpen = true;
               
               // slide and fade in the resources panel
               animResource[i] = {
                  'height': [resourceHeight, resource.defHeight + MySpaces.RESOURCE_PANEL_HEIGHT],
                  'opacity': [resource.getStyle('opacity'), 1]};
   
               // close other open space and toggle this one if it's already open
               spaces.each(function(otherSpace, j)
               {
                  var otherResource = resources[j],
                      otherItem = items[j],
                      otherInfo = infos[j],
                      otherDetail = details[j],
                      otherImg = imgs[j];
                  
                  if (otherSpace == space)
                  {
                     // continue animations that may have been going on before the click
                     // move the item title to the right
                     animItem[j] = {
                        'margin-left': [otherItem.getStyle('margin-left').toInt(), MySpaces.DETAIL_MARGIN],
                        'font-size': [otherItem.getStyle('font-size').toInt(), MySpaces.TITLE_FONT_SIZE]
                     };
                     // fade in the info button
                     animInfo[j] = {'opacity': [otherInfo.getStyle('opacity'), 1]};
                     // slide and fade in the details panel
                     animDetail[j] = {
                        'height': [otherDetail.getStyle('height').toInt(), otherDetail.defHeight + MySpaces.IMG_LARGE],
                        'opacity': [otherDetail.getStyle('opacity'), 1]
                     };
                     // grow the type image
                     animImage[j] = {
                        'height': [otherImg.getStyle('height').toInt(), MySpaces.IMG_LARGE],
                        'width': [otherImg.getStyle('width').toInt(), MySpaces.IMG_LARGE]
                     };
                  }
                  else
                  {
                     // close any other open space
                     otherSpace.isOpen = false;

                     // reset selected class?
                     otherSpace.removeClass('spaceItemSelected');
                     // move the title back to the left?
                     var ml = otherItem.getStyle('margin-left').toInt();
                     if (ml != otherItem.defMarginLeft)
                     {
                        animItem[j] = {
                           'margin-left': [ml, otherItem.defMarginLeft],
                           'font-size': [otherItem.getStyle('font-size').toInt(), otherItem.defFontSize]
                        };
                     }
                     // does this space detail panel need resetting back to it's default height?
                     var h = otherDetail.getStyle('height').toInt();
                     if (h != otherDetail.defHeight)
                     {
                        animDetail[j] = {
                           'height': [h, otherDetail.defHeight],
                           'opacity': [otherDetail.getStyle('opacity'), 0]};
                     }
                     // does the info button need fading out
                     var o = otherInfo.getStyle('opacity');
                     if (o != 0)
                     {
                        animInfo[j] = {'opacity': [o, 0]};
                     }
                     // does the image need shrinking?
                     var ih = otherImg.getStyle('height').toInt();
                     if (ih != MySpaces.IMG_SMALL)
                     {
                        animImage[j] = {
                           'height': [ih, MySpaces.IMG_SMALL],
                           'width': [ih, MySpaces.IMG_SMALL]
                        };
                     }
   
                     // does this space resource panel need resetting back to it's default height?
                     var otherHeight = otherResource.getStyle('height').toInt();
                     if (otherHeight != otherResource.defHeight)
                     {
                        animResource[j] = {
                           'height': [otherHeight, otherResource.defHeight],
                           'opacity': [otherResource.getStyle('opacity'), 0]};
                     }
                     
                     var otherMeta = $E('.spacePreview', otherResource)
                     if (otherMeta)
                     {
                        otherMeta.setStyle('overflow', 'hidden');
                     }
                  }
               });
            }
            else
            {
               // close this space panel
               // flag this space as closed
               space.isOpen = false;
               
               // reset resource panel back to it's default height
               animResource[i] = {
                  'height': [resourceHeight, resource.defHeight],
                  'opacity': [resource.getStyle('opacity'), 0]};
               
               var elePrev = $E('.spacePreview', resource)
               if (elePrev)
               {
                 elePrev.setStyle('overflow', 'hidden');
               }
            }
            fxResource.start(animResource);
            fxItem.start(animItem);
            fxDetail.start(animDetail);
            fxInfo.start(animInfo);
            fxImage.start(animImage);
         });
      });

      $('spacePanel').addEvent('mouseleave', function(e)
      {
         // handler for mouse leaving the entire space panel
         var animItem = {},
             animDetail = {},
             animInfo = {},
             animImage = {};

         spaces.each(function(space, i)
         {
            var item = items[i],
                detail = details[i],
                info = infos[i],
                img = imgs[i];

            if (space.isOpen)
            {
               // continue animations that may have been going on before the click
               // move the item title to the right
               animItem[i] = {
                  'margin-left': [item.getStyle('margin-left').toInt(), MySpaces.DETAIL_MARGIN],
                  'font-size': [item.getStyle('font-size').toInt(), MySpaces.TITLE_FONT_SIZE]
               };
               // fade in the info button
               animInfo[i] = {'opacity': [info.getStyle('opacity'), 1]};
               // slide and fade in the details panel
               animDetail[i] = {
                  'height': [detail.getStyle('height').toInt(), detail.defHeight + MySpaces.IMG_LARGE],
                  'opacity': [detail.getStyle('opacity'), 1]
               };
               // grow the spacetype image
               animImage[i] = {
                  'height': [img.getStyle('height').toInt(), MySpaces.IMG_LARGE],
                  'width': [img.getStyle('width').toInt(), MySpaces.IMG_LARGE]
               };
            }
            else
            {
               space.removeClass('spaceItemSelected');
               animItem[i] = {
                  'margin-left': [item.getStyle('margin-left').toInt(), item.defMarginLeft],
                  'font-size': [item.getStyle('font-size').toInt(), item.defFontSize]
               };
               animDetail[i] = {
                  'height': [detail.getStyle('height').toInt(), detail.defHeight],
                  'opacity': [detail.getStyle('opacity'), 0]
               };
               animInfo[i] = {'opacity': [infos[i].getStyle('opacity'), 0]};
               animImage[i] = {
                  'height': [img.getStyle('height').toInt(), MySpaces.IMG_SMALL],
                  'width': [img.getStyle('width').toInt(), MySpaces.IMG_SMALL]
               };
            }
         });
         fxItem.start(animItem);
         fxDetail.start(animDetail);
         fxInfo.start(animInfo);
         fxImage.start(animImage);
      });
   },
   
   /**
    * Display the Create Space pop-up panel
    */
   createSpace: function(actionEl)
   {
      if (this.popupPanel != null) return;
      
      var panel = $E(".spaceCreateSpacePanel", $(actionEl).getParent());
      panel.setStyle("opacity", 0);
      panel.setStyle("display", "inline");
      var anim = new Fx.Styles(
         panel,
         {
            duration: MySpaces.ANIM_LENGTH,
            transition: Fx.Transitions.linear,
            onComplete: function()
            {
               var nameInput = this.element.getElementById("space-name");
               nameInput.focus();
               nameInput.select();
            }
         });
      anim.start({'opacity': 1});
      
      this.popupPanel = panel;
   },
   
   /**
    * OK button click handler for the Create Space pop-up panel
    */
   createSpaceOK: function(actionEl, path)
   {
      // gather the input data
      var panel = $(actionEl).getParent();
      var spaceName = panel.getElementById("space-name").value;
      var spaceTitle = panel.getElementById("space-title").value;
      var spaceDesc = panel.getElementById("space-description").value;
      
      if (spaceName.length != 0)
      {
         // ajax call to create space
         YAHOO.util.Connect.asyncRequest(
            "POST",
            getContextPath() + '/ajax/invoke/MySpacesBean.createSpace',
            {
               success: function(response)
               {
                  if (response.responseText.indexOf("OK:") == 0)
                  {
                     MySpaces.refreshList();
                  }
                  else
                  {
                     alert("Error during creation of new space: " + response.responseText);
                  }
                  MySpaces.closePopupPanel();
               },
               failure: function(response)
               {
                  alert("Error during creation of new space: " + response.responseText);
                  MySpaces.closePopupPanel();
               }
            }, 
            "path=" + path.replace("_%_", "'") +
            "&name=" + encodeURIComponent(spaceName) +
            "&title=" + encodeURIComponent(spaceTitle) +
            "&description=" + encodeURIComponent(spaceDesc)
         );
      }
   },
   
   /**
    * Display the Upload File pop-up panel
    */
   upload: function(actionEl)
   {
      if (this.popupPanel != null) return;
      
      var panel = $E(".spaceUploadPanel", $(actionEl).getParent());
      panel.setStyle("opacity", 0);
      panel.setStyle("display", "inline");
      
      // Generate a file upload element
      // To perform the actual upload, the element is moved to a hidden iframe
      // from which the upload is performed - this is required as javascript cannot
      // set the important properties on a file upload element for security reasons.
      // <input size="35" style="width:100%" type="file" value="" id="_upload" name="_upload">
      if (this.fileInput == null)
      {
         var fileInput = $(document.createElement("input"));
         fileInput.type = "file";
         fileInput.name = "_upload";
         fileInput.size = "35";
         fileInput.setStyle("width", "100%");
         fileInput.addClass("spaceFormItem");
         fileInput.injectTop(panel);
         this.fileInput = fileInput;
      }
      
      var anim = new Fx.Styles(panel, {duration: MySpaces.ANIM_LENGTH, transition: Fx.Transitions.linear});
      anim.start({'opacity': 1});
      
      this.popupPanel = panel;
   },
   
   /**
    * OK button click handler for the Upload File pop-up panel
    */
   uploadOK: function(actionEl, path)
   {
      // call the upload help to perform the upload
      handleUploadHelper(this.fileInput,
                         "1",   // TODO: generate unique ID? (parent space noderef?)
                         MySpaces.uploadCompleteHandler,
                         getContextPath(),
                         "/ajax/invoke/FileUploadBean.uploadFile",
                         {currentPath: path.replace("_%_", "'")});   // decode path
      this.fileInput = null;
      this.closePopupPanel();
   },
   
   /**
    * Callback function executed after the upload of a new file is complete
    */
   uploadCompleteHandler: function(id, path, fileName, error)
   {
      if (error == null)
      {
         MySpaces.refreshList();
      }
      else
      {
         alert("ERROR: " + error);
      }
   },
   
   /**
    * Delete a space/document item
    */
   deleteItem: function(name, noderef)
   {
      if (confirm("Are you sure you want to delete: " + name))
      {
         // ajax call to create space
         YAHOO.util.Connect.asyncRequest(
            "POST",
            getContextPath() + '/ajax/invoke/MySpacesBean.deleteItem',
            {
               success: function(response)
               {
                  if (response.responseText.indexOf("OK:") == 0)
                  {
                     MySpaces.refreshList();
                  }
                  else
                  {
                     alert("Error during delete of item: " + response.responseText);
                  }
               },
               failure: function(response)
               {
                  alert("Error during delete of item: " + response.responseText);
               }
            }, 
            "noderef=" + noderef
         );
      }
   },
   
   /**
    * Cancel button click handler for various pop-up panels
    */
   closePopupPanel: function()
   {
      if (this.popupPanel != null)
      {
         this.popupPanel.setStyle("display", "none");
         this.popupPanel = null;
      }
   },
   
   /**
    * Refresh the main data list contents within the spacePanel container
    */
   refreshList: function()
   {
      // empty the main panel div and restart by reloading the panel contents
      var spacePanel = $('spacePanel');
      spacePanel.setStyle('visibility', 'hidden');
      // show the ajax wait panel
      $('spacePanelOverlay').setStyle('visibility', 'visible');
      spacePanel.empty();
      spacePanel.removeEvents('mouseleave');
      MySpaces.start();
   }
};

window.addEvent('load', MySpaces.start);