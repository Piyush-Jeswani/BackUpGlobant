module.exports = {
    Organization_Name_lbl:element(by.css(".header_title")),
    Organization_Item_Name_lbl:element.all(by.css(".header_summary_item .item-name")),
    Organization_Item_Value_lbl:element.all(by.css(".header_summary_item .item-value")),
    Organization_Edit_Link:element(by.css(".header_summary .link")),
    settings_Tab:element.all(by.css("div.mat-tab-label-content")),
    
    getOrg_name:function(){
        return this.Organization_Name_lbl;
    },
    getOrg_Item_name:function(item_name){
        if(item_name=="ID")
        {
        return this.Organization_Item_Name_lbl.get(0);
    }
        if(item_name=="Type"){
           
            return this.Organization_Item_Name_lbl.get(1);
        }
    },
    getOrg_Item_value:function(item_value){
        if(item_value=="ID")
        {
            return this.Organization_Item_Value_lbl.get(0);
        }
        if(item_value=="Type"){
            return this.Organization_Item_Value_lbl.get(1);
        }
    },

    getSettings_tab:function(tab_name){
       return element(by.cssContainingText("div.mat-tab-label-content",tab_name));
    },
    
    edit_Organization:function(){
        this.Organization_Edit_Link.click();
    },
  
    selectSettingTab:function(tab_name){
        element(by.cssContainingText("div.mat-tab-label-content",tab_name)).click();
    },
  

};