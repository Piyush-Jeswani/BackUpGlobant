describe("Testing the application", function(){

    // var loginPage = require('../example/loginPage.js');
    it("test case writing", function(){
        browser.get("https://analytics.shoppertrak.com/#/");
        browser.waitForAngular();
        //var title = browser.getTitle();
        browser.driver.manage().window().maximize();

        // loginPage.enterLogin("pjeswani","Globant1");
        // loginPage.clickSubmitBtn();

        element(by.model("vm.username")).sendKeys("pjeswani");
        element(by.model("vm.password")).sendKeys("Globant1");
        element(by.name("submitButton")).click();

        //browser.sleep(50000000);
       
        

        var scrolldown = $$('.traffic-per-weekday-widget .btn.btn-default.btn-xs.ng-scope').get(0);
        
        browser.controlFlow().execute(function() {
            browser.executeScript('arguments[0].scrollIntoView(true),arguments[1].click();', scrolldown.getWebElement(),scrolldown.getWebElement());
            
        });

        // var moveElement = function(locator){
        //     browser.executeScript('arguments[0].scrollIntoView(true),arguments[1].click();', element(by.css(locator), element(by.css(locator))))
        // }

        //browser.sleep(5000000);
                  
      //ag-cell ag-cell-not-inline-editing ag-cell-no-focus traffic ag-cell-value ng-scope

      //.ag-cell-no-focus.traffic span nth-child(1)  from 9 to 16
      //.ag-cell-no-focus.traffic_change_numeric span    from 1 to 8 ---8 th being null
      //.ag-cell-no-focus.sales span  from 9 to 16
      //.ag-cell-no-focus.ats span  from 1 to 8
      //.ag-cell-no-focus.ats span_change_numeric  from 1 to 8
      //.ag-cell-no-focus.star span  from 9 to 16
      //.ag-cell-no-focus.star_change_numeric span from 1 to 8 .. 8 being null     

      
  

       
                var expectedDetails = function(locator){
                    return element.all(by.css(locator)).filter(function(elem, index){        
                    return  elem.getText().then(function(txt){        
                    return (txt!='' && index!=elem.length);           
                    })
                }) .getText().then(function(val){ //Unsorted  
                    for(var i =0; i<val.length;i++){
                        val[i] = val[i].replace(',','')
                        val[i] = val[i].replace('$','')
                        val[i] = val[i].replace('%','')
                    }                     
                    return val;//expected Sorted array
                }) 
            }

           
           

                var trafficData = expectedDetails('.traffic-per-weekday-widget-table-area.showTable .ag-cell-value.traffic span').then(function(x){
                    console.log("printing traffic array : "+x);
                });   
                        browser.sleep(3000);                     

                element.all(by.css(".ag-header-cell.ag-header-cell-sortable.traffic .ag-header-cell-label")).map((ele, index) => {
                    console.log("GOing for click of traffic")

                    if(index==1){
                        ele.click();
                     }
                })
                        browser.sleep(3000000000);

                var trafficDataPostClick = expectedDetails('.traffic-per-weekday-widget-table-area.showTable .ag-cell-value.traffic span').then(function(x){
                        console.log("printing aftering UI Sort : "+x);
                }); 

                    expect(trafficDataPostClick).toBe(trafficData);

                        browser.sleep(5000);

                 // var trafficData = expectedDetails('.ag-cell-no-focus.traffic span').map(function(ele, index){
            //     ele.getText().then(function(text){
            //         console.log(text);
            //     })
            // }) 


            browser.sleep(3000000000);






                // var salesData = expectedDetails('.ag-cell-no-focus.sales span').then(function(x){
                //     console.log("printing sales array : "+x);
                //     }); 

                // var atsData = expectedDetails('.ag-cell-no-focus.ats span').then(function(x){                    
                //     console.log("printing ats array : "+x);        
                //     }); 

                // var conversionData = expectedDetails('.ag-cell-no-focus.conversion span').then(function(x){                    
                //     console.log("printing conversion array : "+x);        
                //     }); 

                // var starData = expectedDetails('.ag-cell-no-focus.star span').then(function(x){                    
                //     console.log("printing star array : "+x);        
                //     });


        //  browser.sleep(5000000);

        //  var trafficELem = element.all(by.css(".ag-header-cell.ag-header-cell-sortable.traffic .ag-header-cell-label")).then(function(e){
        //     console.log("Printing length : "+e.length);
        //     console.log("Printing e : "+e[1]);
        //     browser.sleep(5000);
            
        //     e[1].click();


        //  })
        browser.sleep(5000);
         //element.all(by.css(".ag-header-cell.ag-header-cell-sortable.traffic .ag-header-cell-label")).last().click();
        
         browser.sleep(50000);

            
         
    })
  

})