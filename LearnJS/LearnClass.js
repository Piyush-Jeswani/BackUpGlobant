class login{

    constructor(username, password){
        this.username = username;
        this.password = password;        
    }

    loginInto(){
        // browser.get("http://tgl-onprem11.rctanalytics.com/#/");
        element(by.model("vm.username")).sendKeys(this.username);
        element(by.model("vm.password")).sendKeys(this.password);
        element(by.name("submitButton")).click();
    }
    
}

var obj = new login("development", "myD3v3l0pm3ntP4ssw0rd");
obj.loginInto();