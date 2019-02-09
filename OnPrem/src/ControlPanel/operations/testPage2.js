var obj = require('D:/Git/Tyco/OnPrem/pages/testPage.js');

var d = require('D:/Git/Tyco/OnPrem/pages/data.js');
var d2 = require('D:/Git/Tyco/OnPrem/pages/data2.js');
var using = require('jasmine-data-provider');
describe('THis is just to test',function(){

    beforeEach(function(){
        //Open the URL here which will help you know if environment is down 

    });
    using(d2.mainData,function(datas,description){

   

    it('Testing',function(){
        obj.getModel();

        console.log(obj.locator);
        
        // Use element keeping it in common file 
        
        obj.textBox.sendKeys(d.datadrive2.hello);
        obj.textBox.sendKeys(datas.datadrive2.hello);

    });

});

    afterEach(function(){
        //This can be useful if you want to delete cookies or take screen shot
    })
   
});


