describe("Testing the application", function(){
    it("test case writing", function(){
    browser.get("https://analytics.shoppertrak.com/#/");
    browser.driver.manage().window().maximize();
    element(by.model("vm.username")).sendKeys("pjeswani");
    element(by.model("vm.password")).sendKeys("Globant1");
    element(by.name("submitButton")).click();
    browser.sleep(1000);
    
    var scrolldown = $$('.traffic-per-weekday-widget .btn.btn-default.btn-xs.ng-scope').get(0);
    browser.sleep(5000)
    browser.controlFlow().execute(function() {
    browser.executeScript('arguments[0].scrollIntoView(true),arguments[1].click();', scrolldown.getWebElement(),scrolldown.getWebElement());
    //element(by.css('.traffic-per-weekday-widget .btn.btn-default.btn-xs.ng-scope')).click();
    //scrolldown.click();
    });
    
    
 
    element(by.css('ag-summary-table.showTable')).isDisplayed().then(function(tablepresent){
 
 if(tablepresent){
 
  element(by.css('ag-summary-table.showTable div.ag-body-container div:nth-child(1) div:nth-child(2) span')).getText().then(function(text){
  
  })      
 
      
 }
    })
    browser.sleep(15000);
    var x = new Array(11);
    for(var j=1;j<=11;j++)
    {
        x[j] = new Array(7);
    for (var i = 1; i <=7; i++) {
        
 x[j][i]=tableData(i,j);
 console.log(x[j][i]);
    }
    }
    })
    

    
    var tableData = function(row,col){
        var classname = "ag-summary-table.showTable div.ag-body-container div:nth-child("+row+") div:nth-child("+col+")";
        element(by.css(classname)).getText().then(function(text){
         console.log(text);
        });
     return "";
      };
  
    })