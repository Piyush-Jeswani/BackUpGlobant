(() => {
  'use strict';
    
   class environmentConfigService{
     constructor(){}
   /* get the environment value from the urls */
     getEnvironmentName(){
       let envHost = window.location.hostname;
       let env_name;
       if(envHost === 'localhost'){
         env_name = 'local';
       }
       else if(envHost.includes('staging')){
         env_name = 'staging';
       }
       else if(envHost.includes('s3.amazonaws')){
         env_name = 'local-test';
       }
       else if(envHost === 'analytics.shoppertrak.com'){
         env_name = 'production';
       }
       else{
         env_name = null;
       }
       return env_name;
      }
   }

angular.module('shopperTrak')
.service('environmentConfig', environmentConfigService);
})();