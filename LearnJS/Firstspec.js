describe("Testing first program",function(){
    it("First Test case",function(){
        // browser.waitForAngularEnabled(false);
        browser.get("https://angularjs.org/");
        
    })
})

describe("Testing the application", function(){
    it("test case writing", function(){
        browser.get("https://angularjs.org/");
        element(by.modal("yourName")).sendKeys("Piyush");
        element(by.binding(""))
    })

});