
var common = function(){

    this.newWindow = function(){       
        browser.getAllWindowHandles().then(function (handles) {
               var secondWindow = handles[1];                  
               browser.switchTo().window(secondWindow).then(function () {                    
                browser.getTitle().then(function(txt){
                    console.log("#################  "+ txt+"     #########");
                    return txt;
                })                       
               });
        });  
};





};

module.exports = new common();