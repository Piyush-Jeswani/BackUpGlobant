const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const homePage = require('../operations/homePageOperation.js');
const dataValues = require('../resources/ON167.json');
const organizationPage = require('../operations/organizationOperation.js');
const EC = protractor_1.ExpectedConditions;
const orgComponent = require('../components/OrganizationComponents.js');

//ON-172 --- on 52 and on 88

describe("Super User should have ability to allow Occupancy subscription metric",function(){

    it("Super User", function(){
        browser.get("http://tgl-onprem11.rctanalytics.com/");  
        element(by.model("vm.username")).sendKeys("development");
        element(by.model("vm.password")).sendKeys("myD3v3l0pm3ntP4ssw0rd!");
        element(by.name("submitButton")).click();
        
        
        element(by.css(".dropdown[ng-if='adminToolAccess']")).click();
        element(by.css("[ng-click='navigateToAdmin()']")).click();

        element.all(by.css('.table.table-striped tbody tr[ng-repeat] td.org-actions span.icon.icon-edit')).map(function(ele, index){
            if(index==2){
                ele.click();
            }
        })

        browser.sleep(15000);

        element(by.css(".super-admin-tab [data-target='#su-advanced']")).click();
        browser.sleep(5000);
        // let occup = element(by.css(".occupancy-info"));
        expect(element(by.css(".occupancy-info")).isDisplayed()).toBe(true); 
        // browser.actions().mouseMove(occup); 
        // expect(element(by.css(".tooltip.in.am-fade.top")).isDisplayed()).toBe(true);  
        browser.sleep(10000);

        let occupBtn = element(by.cssContainingText('.disabled-text', 'Occupancy'));   
        expect(occupBtn.isDisplayed()).toBe(true);

        expect(element(by.cssContainingText('.option>h3', 'Realtime traffic')).isDisplayed()).toBe(true);
        let realTrafficSwitch = element(by.xpath("//div[contains(@class,'option')]//h3[contains(text(),'Realtime traffic')]/parent::div//span[@class='ui-switch']"));
        realTrafficSwitch.click();
        let realTrafficSwitchOn = element(by.xpath("//div[contains(@class,'option')]//h3[contains(text(),'Realtime traffic')]/parent::div//span[@class='ui-switch chosen']"));

        let occupancySwitchOff = element(by.xpath("//div[contains(@class,'option')]//h3[contains(text(),'Occupancy')]/parent::div//span[@class='ui-switch']"));        
        occupancySwitchOff.click();
        let occupancySwitchOn = element(by.xpath("//div[contains(@class,'option')]//h3[contains(text(),'Occupancy')]/parent::div//span[@class='ui-switch chosen']"));

        expect(occupancySwitchOn.isDisplayed()).toBe(true);

        browser.sleep(10000);
       

        element.all(by.css(" button.btn.btn-primary")).map(function(ele,index){
            if(index==1){
                ele.click();
            }
        })
        browser.sleep(10000);
        expect(occupancySwitchOn.isDisplayed()).toBe(true);
        occupancySwitchOn.click();
        realTrafficSwitchOn.click();

        element.all(by.css(" button.btn.btn-primary")).map(function(ele,index){
            if(index==1){
                ele.click();
            }
        })

    })
})