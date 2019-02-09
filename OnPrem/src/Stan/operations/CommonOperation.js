const env = require( '../../../env.js');
var commonOperation = function(){

    this.chooseOptionInSelect = function(dropDown, text, option){
        element(by.css(dropDown)).click();
        element(by.cssContainingtext(text,option)).click();        
    };

    this.waitForElementVisibility = function(locator) {
        return browser.wait(ExpectedConditions.visibilityOf($(locator)), 10000, "Error");
        };

        this.customWait_visibilityOf=function(elemtobeWaitfor,timeout){
            browser.wait(protractor.ExpectedConditions.visibilityOf(elemtobeWaitfor,timeout));
        };

      

        let selectYear = function(year_btn,year){

            element(by.cssContainingText("div.mat-calendar-body-cell-content",year)).isPresent().then(function(status){
                if(status==true){
                    element(by.cssContainingText("div.mat-calendar-body-cell-content",year)).click();
                    return 0;
                }
                else{
                    year_btn.click();
                   return selectYear(year_btn,year);
                }
            })
        }
       this.selectDate=function(date){
            let year="2050";
            let month="JUN";
            let day="12";
            browser.wait(ExpectedConditions.visibilityOf($("div.mat-calendar-arrow"), 10000, "Error"));
            $("div.mat-calendar-arrow").click();
            let previous_year_btn = $("button.mat-calendar-previous-button");
            let current_date = new Date();
            current_year=current_date.getFullYear();
            let next_year_btn = $("button.mat-calendar-next-button");
            let required_year_div =element(by.cssContainingText("div.mat-calendar-body-cell-content",year));
            element(by.cssContainingText("div.mat-calendar-body-cell-content",year)).isPresent().then(function(status){
                if(status==true){
                    element(by.cssContainingText("div.mat-calendar-body-cell-content",year)).click();
                }
                else{
                   if (year>current_year){
                    next_year_btn.click();
                      let req_year=selectYear(next_year_btn,year);
                   
                    
                   }
                   else{
                        previous_year_btn.click();
                        let req_year=selectYear(previous_year_btn,year);
                    }
                }
            })
    
           
            let required_month=element(by.cssContainingText("div.mat-calendar-body-cell-content",month));
            let required_day=element(by.cssContainingText("div.mat-calendar-body-cell-content",day));
            browser.wait(ExpectedConditions.visibilityOf(required_month, 10000, "Error"));
            required_month.click();
            browser.wait(ExpectedConditions.visibilityOf(required_day, 10000, "Error"));
            required_day.click();
            
        }
};

module.exports = new commonOperation();