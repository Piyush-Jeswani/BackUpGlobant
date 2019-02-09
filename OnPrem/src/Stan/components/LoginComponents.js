const commonOperation =require('../operations/CommonOperation.js');
module.exports = {
  login:{
  userName_input : element(by.model("vm.username")),
  password_input : element(by.model("vm.password")),
  submit_btn : element(by.name("submitButton"))
},

  loginCP:{
  userNameCP_input :element(by.css("[placeholder='YOUR USERNAME']")),
  passwordCP_input :element(by.css("[placeholder='YOUR PASSWORD']")),
  loginCP_btn : element(by.css(".btn-primary"))
},

  loginToApplication:function(userName,passWord){
    let login = this.login;
    login.userName_input.sendKeys(userName);
    login.password_input.sendKeys(passWord);
    login.submit_btn.click();
  },

  loginToApplication_CP:function(userName,passWord){
    let login = this.loginCP;
    login.userNameCP_input.sendKeys(userName);
    login.passwordCP_input.sendKeys(passWord);
    login.loginCP_btn.click();
    
  }
};

