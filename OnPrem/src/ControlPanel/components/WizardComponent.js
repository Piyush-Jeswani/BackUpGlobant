module.exports = {
    letStart_btn:$(".btn-primary"),
    shopperTrak_div:$("div.shoppertrak"),
    welcomeTo_div:$("div.welcome_to"),
    label_1:$("div.lbl1"),
    label_2:$("div.lbl2"),

    getletStart:function(){
        return this.letStart_btn;
    },
    clickLetStart:function(){
        this.letStart_btn.click();
    },
    getWelcomeText:function(){
        return this.welcomeTo_div.getText();
    },
    getShopperTrakText:function(){
        return this.shopperTrak_div.getText();
    },
    getLabel1Text:function(){
        return this.label_1.getText();
    },
    getLabel2Text:function(){
        return this.label_2.getText();
    }

}