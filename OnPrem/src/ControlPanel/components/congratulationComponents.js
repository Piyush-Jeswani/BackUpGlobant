module.exports = {
    
    congratulationLabel:$("div.shoppertrak"),
    editOrganizationBtn :$("div.actions button:nth-child(1)"),
    createNewSite:$("div.actions > button:nth-child(2)"),
    successfulMsgLbl:$(".success div.lbl1"),

    getNewSiteBtn:function(){
        return this.createNewSite;
    },

    clickNewSite:function(){
        return this.createNewSite.click();
    },

    getEditorganizationBtn:function(){
        return this.editOrganizationBtn;
    },
    clickEditOrganization:function(){
        return this.editOrganizationBtn.click();
    },

    readCongratsMessage:function(){
        return this.congratulationLabel.getText();
    },

    getSuccesslabeltext:function(){
        return this.successfulMsgLbl.getText();
    }

}