/**
 * Copyright (C) 2005-2009 Alfresco Software Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

 * As a special exception to the terms and conditions of version 2.0 of 
 * the GPL, you may redistribute this Program in connection with Free/Libre 
 * and Open Source Software ("FLOSS") applications as described in Alfresco's 
 * FLOSS exception.  You should have recieved a copy of the text describing 
 * the FLOSS exception, and it is also available here: 
 * http://www.alfresco.com/legal/licensing
 */
 
/**
 * RecordsFolderDetails template - DOD5015 extensions.
 * 
 * @namespace Alfresco
 * @class Alfresco.RecordsFolderDetails
 */
(function()
{
   /**
    * RecordsFolderDetails constructor.
    * 
    * @return {Alfresco.RecordsFolderDetails} The new RecordsFolderDetails instance
    * @constructor
    */
   Alfresco.RecordsFolderDetails = function RecordsFolderDetails_constructor()
   {
      Alfresco.RecordsFolderDetails.superclass.constructor.call(this);
      
      /* Decoupled event listeners */
      YAHOO.Bubbling.on("detailsRefresh", this.onReady, this);

      return this;
   };
   
   YAHOO.extend(Alfresco.RecordsFolderDetails, Alfresco.FolderDetails,
   {
      /**
       * Fired by YUI when parent element is available for scripting.
       * Template initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function RecordsFolderDetails_onReady()
      {
         var config =
         {
            method: "GET",
            url: Alfresco.constants.PROXY_URI + 'slingshot/doclib/dod5015/doclist/folders/node/' + 
                 this.options.nodeRef.replace(":/", "") + '?filter=node',
            successCallback: 
            { 
               fn: this._getDataSuccess, 
               scope: this 
            },
            failureMessage: "Failed to load data for folder details"
         };
         Alfresco.util.Ajax.request(config);
      }
   });
})();
