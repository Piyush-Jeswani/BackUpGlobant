module.exports = {
    search_Zones_Input:element(by.css("[placeholder='Type Zone name ...']")),
    zone_Entrance_btn:element(by.css(".actions button")),
    total_zone_count:$("span.total"),
    zoneRow:$$("tr:not([class='detail-row mat-row ng-tns-c26-10 ng-star-inserted'])"),
    
    Zone_name_lbl:$('td.cdk-column-name div.column_name'),
    Zone_Id_lbl:$('td.cdk-column-id div.column_name'),
    Zone_Effective_Date_lbl:$('td.cdk-column-effective_date div.column_name'),
    Zone_End_Date_lbl:$('td.cdk-column-end_date div.column_name'),
    Zone_name__value_lbl:$('td.cdk-column-name div.column_value'),
    Zone_Id__value_lbl:$('td.cdk-column-id div.column_value'),
    Zone_Effective_Date_value_lbl:$('td.cdk-column-effective_date div.column_value'),
    Zone_End_Date_value_lbl:$('td.cdk-column-end_date div.column_value'),
    Zone_Edit_Link:$$('td.cdk-column-menu'),
    zone_Sub_Row:$$(".detail-row.mat-row.ng-star-inserted"),
    

    Entrance_name_lbl:element.all(by.css('.entrance-details-row div.mat-column-name .column_name')),
    Entrance_Id_lbl:element.all(by.css('.entrance-details-row div.mat-column-id .column_name')),
    Entrance_Effective_Date_lbl:element.all(by.css('.entrance-details-row div.mat-column-effective_date .column_name')),
    Entrance_End_Date_lbl:element.all(by.css('.entrance-details-row div.mat-column-end_date .column_name')),
    Entrance_name__value_lbl:element.all(by.css('.entrance-details-row div.mat-column-name .column_value')),
    Entrance_Id__value_lbl:element.all(by.css('.entrance-details-row div.mat-column-id .column_value')),
    Entrance_Effective_Date_value_lbl:element.all(by.css('.entrance-details-row div.mat-column-effective_date .column_value')),
    Entrance_End_Date_value_lbl:element.all(by.css('.entrance-details-row div.mat-column-end_date .column_value')),
    Entrance_Edit_Link:element.all(by.css('div.mat-column-menu')),
    Entrance_Zone_Type_lbl:element.all(by.css('.entrance-details-row div.mat-column-type .column_name')),
    Entrance_Zone_Type_value_lbl:element.all(by.css('.entrance-details-row div.mat-column-type .column_value')),
    Entrance_Traffic_Counter_lbl:element.all(by.css('.entrance-details-row div.mat-column-traffic_counters .column_name')),
    Entrance_Traffic_Counter_value_lbl:element.all(by.css('.entrance-details-row div.mat-column-traffic_counters .column_value')),

    SubZone_name_lbl:element.all(by.css('.sub-zones-details div.mat-column-name .column_name')),
    SubZone_name_value_lbl:element.all(by.css('.sub-zones-details div.mat-column-name .column_value')),
    SubZone_Id_lbl:element.all(by.css('.sub-zones-details div.mat-column-id .column_name')),
    SubZone_Id_value_lbl:element.all(by.css('.sub-zones-details div.mat-column-id .column_value')),
    SubZone_type_lbl:element.all(by.css('.sub-zones-details div.mat-column-type .column_name')),
    SubZone_type_value_lbl:element.all(by.css('.sub-zones-details div.mat-column-type .column_value')),
    SubZone_effective_date_lbl:element.all(by.css('.sub-zones-details div.mat-column-effective_date .column_name')),
    SubZone_effective_date_value_lbl:element.all(by.css('.sub-zones-details div.mat-column-effective_date .column_value')),
    SubZone_end_date_lbl:element.all(by.css('.sub-zones-details div.mat-column-end_date .column_name')),
    SubZone_end_date_value_lbl:element.all(by.css('.sub-zones-details div.mat-column-end_date .column_value')),

    expand_Or_Collapse_Zone_dropdown:$$("td.mat-column-expand mat-icon"),
    editEntrance_Link:$$("div.entrance-details-row  .fa-pencil-square-o"),
    
   
    getSearchZone:function(){
        return this.search_Zones_Input;
    },
    getedit_zone:function(){
       return this.Zone_Edit_Link.get(0);
    },

    getTotalZoneCount:function(){
       return this.total_zone_count.getText();
    },
    getZoneorEntranceButton:function(btn_name){
      return element(by.cssContainingText(".actions button",btn_name));
    },

    getZoneName:function(){
        let row =this.getZoneRow();
        
        // return this.Zone_name_lbl.get(0);
    },

    getZoneName_Value:function(){
        return this.Zone_name__value_lbl.get(0);
    },
    getZoneRow:function(){
        return this.zoneRow.get(0);
    },


    
    getZoneId:function(){
        return this.Zone_Id_lbl.get(0);
    },

    getZoneId_Value:function(){
        return this.Zone_Id__value_lbl.get(0);
    },

    
    getZoneEffectiveDate:function(){
        return this.Zone_Effective_Date_lbl.get(0);
    },

    getZoneEffectiveDate_Value:function(){
        return this.Zone_Effective_Date_value_lbl.get(0);
    },

    getZoneEndDate:function(){
        return this.Zone_End_Date_lbl.get(0);
    },

    
    getZoneEndDate_Value:function(){
        return this.Zone_End_Date_value_lbl.get(0);
    },

    clickZoneEntranceButton:function(btn_name){
        element(by.cssContainingText(".actions button",btn_name)).click();
    },

    expandorCollapseZone:function(){
    //    return this.expand_Or_Collapse_Zone_dropdown.get(1).getAttribute("style").then(function(style){
    //         if(style=="transform: rotate(0deg);"){
    //         return "Expand";
    //         }
    //         else{
    //             return "Collapse";
    //         }
            
    //     })

        this.expand_Or_Collapse_Zone_dropdown.get(1).click();
        this.editEntrance();
    },
    editEntrance:function(){
        this.editEntrance_Link.get(0).click();
    },

    verifyZoneRows:function(){
        this.zoneRow.each(function(element, index) {
            expect(element.$('td.cdk-column-name div.column_name').getText()).toBe("ZONE NAME");
            expect(element.$('td.cdk-column-id div.column_name').getText()).toBe("ID");
            expect(element.$('td.cdk-column-effective_date div.column_name').getText()).toBe("EFFECTIVE DATE");
            expect(element.$('td.cdk-column-end_date div.column_name').getText()).toBe("END DATE");

            expect(element.$('td.cdk-column-menu').isDisplayed()).toBe(true);

            element.$('.cdk-column-expand.mat-column-expand').isPresent().then(function(present){
                if(present){
                    element.$('.cdk-column-expand.mat-column-expand').click().then(function(test){
                        $$(".detail-row.mat-row.ng-star-inserted").each(function(ele,ind){
                            ele.$('.sub-zones-details').isPresent().then(function(status){
                                if(status){
                                    ele.$$('.sub-zones-details').each(function(elem,i){
                                        expect(elem.$('div.mat-column-name .column_name').getText()).toBe("SUB ZONE NAME");
                                        expect(elem.$('div.mat-column-id .column_name').getText()).toBe("ID");
                                        expect(elem.$('.sub-zones-details div.mat-column-type .column_name').getText()).toBe("ZONE TYPE");
                                        expect(elem.$('.sub-zones-details div.mat-column-effective_date .column_name').getText()).toBe("EFFECTIVE DATE");
                                        expect(elem.$('.sub-zones-details div.mat-column-end_date .column_name').getText()).toBe("END DATE");
                                        
                                        

                                    })
                                }
                            })
                            ele.$('.entrance-details').isPresent().then(function(status){
                                if(status){
                                    ele.$$('.entrance-details').each(function(elem,i){
                                        expect(elem.$('div.mat-column-menu').isDisplayed()).toBe(true);
                                        expect(elem.$('div.mat-column-name .column_name').getText()).toBe("ENTRANCE NAME");
                                        expect(elem.$('div.mat-column-id .column_name').getText()).toBe("ID");
                                        expect(elem.$('div.mat-column-type .column_name').getText()).toBe("ZONE TYPE");
                                        expect(elem.$('div.mat-column-effective_date .column_name').getText()).toBe("EFFECTIVE DATE");
                                        expect(elem.$('div.mat-column-end_date .column_name').getText()).toBe("END DATE");
                                        expect(elem.$('div.mat-column-traffic_counters .column_name').getText()).toBe("TRAFFIC COUNTERS");
                                        
                                    })
                                }
                            })

                        })
                    })

                }

            })


            // element.$('td.cdk-column-name div.column_value').getText().then(function(text){

            // })
            // expect(element.$('td.cdk-column-id div.column_value').getText()).toBeNonEmptyString();
            // expect(element.$('td.cdk-column-effective_date div.column_value').getText()).toBeNonEmptyString();
            // expect(element.$('td.cdk-column-end_date div.column_value').getText()).toBeNonEmptyString();

            
        })

       
    }
   
}