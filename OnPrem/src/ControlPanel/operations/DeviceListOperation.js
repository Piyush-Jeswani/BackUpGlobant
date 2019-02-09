const deviceListCom = require('../components/DeviceDashboard/DeviceListComponents.js');
module.exports = {

    clickSnapshot:function (){
        deviceListCom.clickFirstCamera();
    },

    validateElementsArePresent:function(){
        deviceListCom.checkAllElementsArePresent();
    },
    validateCameraAndVideoIconsArePreent:function(){
        deviceListCom.checkSnapShotIconAreVisible();
    }
};