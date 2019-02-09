

var createSiteConfig = function(){

    this.siteName = element(by.css("input[placeholder='site name']"));
    this.siteID = element(by.css("input[placeholder='site id']"));
    this.custID = element(by.css("input[placeholder='cust id']"));
    this.reportingName = element(by.css("input[placeholder='reporting name']"));
    this.siteType = element(by.css("[placeholder='site type'] "));
    this.currency = element(by.css("[placeholder='currency'] "));
    this.siteMidnightHour = element(by.css("[placeholder='site midnight hour']"));
};