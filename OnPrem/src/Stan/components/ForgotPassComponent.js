
var forgotPassComponent = function() {

    this.pageHeader = element(by.css('.page-header'));
    this.username = element(by.model("vm.username"));
    this.sendBtn =  element(by.css("[name='submitButton']"));

    this.email = element(by.css('.hashEmail'));
    this.para = element(by.xpath("//h1[@class='page-header']/parent::div/p"));
    this.back = element(by.css('.back-to-home a'));

   
  };
  module.exports = new forgotPassComponent();