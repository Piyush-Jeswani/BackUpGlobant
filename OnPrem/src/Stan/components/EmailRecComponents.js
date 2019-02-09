
var emailRecComponent = function() {
    this.email = element(by.css("input[type='email']"));
    this.nextBtn = element(by.css("#identifierNext"));
    this.password =  element(by.css("input[type='password']"));
    this.passwordNext = element(by.css("#passwordNext"));
    this.unreadMail = element(by.xpath("//tr[@class='zA zE']//span[@email='support@shoppertrak.com']"));
    this.changePswdBtn = element(by.xpath("//a[contains(@href,'tgl-onprem11.rctanalytics.com/#/reset-password')]"));
    this.changePasswrd = element(by.css('.page-header'));
    this.newPasswrd = element(by.css('[ng-model="vm.newPassword"]'));
    this.newPasswrdConfirm = element(by.css('[ng-model="vm.newPasswordConfirmation"]'));
    this.submitBtn = element(by.css('[name="submitButton"]'));
    this.inbox = element(by.xpath("//a[@title='Inbox']"));
    this.checkbox = element(by.xpath('//span[@name="support@shoppertrak.com"]/ancestor::tr//div[@role="checkbox"]'));
    this.delete = element(by.xpath("//div[@data-tooltip='Delete']"));
  };
  module.exports = new emailRecComponent();