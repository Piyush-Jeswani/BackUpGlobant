var loginPage = require('D:/Git/Tyco/OnPrem/pages/loginPage.js');
var dataValues = require('D:/Git/Tyco/OnPrem/data/dataValues.js');
var homePage = require('D:/Git/Tyco/OnPrem/pages/homePage.js');
var protractor_1 = require("protractor");
var EC = protractor_1.ExpectedConditions;
var showTable = element(by.buttonText('Show table'));




describe('As a customer, one can see AG Grid applied to Real Time Data', function(){

    beforeEach(function(){
        console.log("Inside Before each");        
    });
    it('Validating AG grid applied to Real Time Data', function(){

        loginPage.openBrowser();     
        loginPage.enterLogin(credentials.username,credentials.password);
        loginPage.clickSubmitBtn();  
        
        browser.sleep(2000);
        homePage.clickAdminDropDown();
        homePage.clickAnalyticsOptionInDropDown();             
        homePage.clickOrganisationDropDown();       
        homePage.selectSiteName(organisation.northFace);
        homePage.clickSiteDropDown();
        browser.sleep(8000);
        homePage.selectSiteName(organisation.chicago); //sanFrancisco //chicago
        browser.sleep(8000);

        homePage.clickRealTimeData();
        browser.sleep(5000);
        // browser.wait(EC.visibilityOf(showTable),5000);

        browser.executeScript('arguments[0].scrollIntoView(true)',element(by.css('.data-section.full-height .btn.btn-default span')));
        homePage.clickShowTableButton();         
        browser.sleep(5000);       
       
        // We need to Expect that no of rows shouldn't be more than 12 visible, we need to scroll for it.
        // If we try to getText, we find that all rows above 12 values show up as 0 even after it gives as 
        homePage.getCountOfRowsRealTimeData().then(function(aa){
            console.log("Printing properly + "+ aa.length);            
            expect(aa.length).toBeGreaterThan(0);
            if (aa.length > 12){
                let a = aa[13].getText().then((text)=>{
                    console.log("Printing 13 Value : "+text);
                    return text;
                });
                // for (let i = 13; i <= aa.length; i++){
                //     expect(aa[i].getText()).toBe("0");
                // }
                
            }
        })

        // Here we are scrolling to Hide Table Button.
        browser.executeScript('arguments[0].scrollIntoView(true)',element(by.css("[ng-click='vm.setShowTable(false)']")));
        homePage.clickColumnForSorting("hour");
        browser.sleep(5000);    
    

        let arr1 = [1,2,3,4];      
        let arr2 = homePage.getAllColumnValues("hour");
        // console.log("Printing sorted array : "+arr2.sort());
        
        homePage.clickColumnForSorting("Traffic");
        browser.sleep(5000);
        homePage.getAllColumnValues("traffic").then(function(col){
            console.log("Printing values from Traffic : "+col)
            // expect(col).toBe(col.sort()); 
        });

            homePage.getRightClickOptions("traffic").map(function(ele,index){
                if(index==0){expect(ele.getText()).toBe("Copy");}
                if(index==1){expect(ele.getText()).toBe("Copy with Headers");}
                if(index==2){expect(ele.getText()).toBe("Paste");}
                if(index==3){expect(ele.getText()).toBe("Tool Panel");}
                if(index==4){expect(ele.getText()).toBe("Export");}

                homePage.getRightClickOptions("traffic").getText().then((text)=>{
                    expect(text[0]).toBe("Copy");
                })

               
            }); 

    });
});