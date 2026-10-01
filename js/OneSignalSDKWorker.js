if( 'function' === typeof importScripts) {
importScripts('https://clicksophia.agiuscloud.com/service-worker.js');
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');
       var headers = new Headers();
        headers.append('Service-Worker-Allowed', '/');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/OneSignalSDKWorker.js');
          //navigator.serviceWorker.register('https://www.clicksophia.com.br/service-worker.js');
        }

}