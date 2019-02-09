function test(){

    this.locator = "by.css('input')";

    this.textBox = element(by.css('input'));

    this.getModel =function(){
    console.log("Testing");
    
    }
};
module.exports = new test();

// var a = new test();
// a.getModel();