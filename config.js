

const https = require('https');
const http = require('http');

const puppet_args = {
        // NOTE: IF U WANT TO ACCESS IFRAME FROM DIFFERENT ORIGIN (CROSS-DOMAIN)
        // U MUST RUN with chrome_headless : enebled otherwise will not 
        // work
		"chrome_headless": "dissabled", // hide google chrome window
        "webrtc_ext":"extensions/webrtc",
		"chrome_options": [/*"--headless",*/"--disable-setuid-sandbox"
                     ,"--disable-web-security"
                      // this and disable-web-security , seem to fix the problem with iframes cross-domain load
                     ,"--disable-features=site-per-process"
                    ,"--no-zygote"
                    ,"--disable-gpu", "--no-sandbox"
                    ,"--disable-infobars","--window-position=0,0"
                    ,"--ignore-certifcate-errors","--ignore-certifcate-errors-spki-list",], // google chrome args
                            
        "chrome_useragent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)", // overwrite chrome user agent
		"chrome_executable_path": "" /* If you want run installed chrome browser, not from npm module
									  *  example for Mac OS: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
									  *  example for Linux:  /usr/bin/chromium
									  */
	};
const proxy =  { // Override by program
      "fetch_url":"http://127.0.0.1:8080/?p=5&l=5",
      // this can be linked to selectors cause we can deploy 
      // this program to different servers but we can change the
      // selectors so in this way server will record which one is the
      // last requested proxy per selector
      "loaded":[], // Load proxies from fetch_url into array
	  "row":"6", // defult raw is 6
      "url_sleep":"5",// in SECONDS
		"server": "",
		"port": "",
	};

module.exports.proxy = proxy;
module.exports.puppet_args = puppet_args;
async function loadProxy()
{ 
    var proxy = module.exports.proxy;
    let url = new URL(proxy.fetch_url);
    /*log.info("getProxy():readProxyURL"," URL PROTOCOL [" 
    + url.protocol + "][" + url.host + "][" + url.pathname + "]>>>>>");
    */
    let client;
    if (url.protocol=="https")
     client = https; /* default  client  */
    else 
        client= http; 
    return new Promise((resolve,reject)=>{
    client.get(proxy.fetch_url, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
		//  console.log(JSON.parse(data));
        resolve(JSON.parse(data));//.explanation);
  
      });

    }).on("error", (err) => {
      console.error("readProxyURL():error","getProxy() ==> Error Readig  Proxies: " + err);
      reject(err);
    });
    })
}

module.exports.nextProxy = async ()=>
{
  var p = "";
  //var proxy = module.exports.proxy.loaded;
  console.log(module.exports.proxy.loaded);
  if (module.exports.proxy.loaded.length > 0)
  {
	  p = module.exports.proxy.loaded.shift(); //module.exports.proxy.loaded[0];
	  
	  
  }else{
	 // console.log(" >>>>> LOADING PROXIES >>>> ");
	  var proxy = await loadProxy();
	  if (typeof proxy === 'undefined' || proxy.length == 0)
		{
			await sleep(30*1000);
			//continue;
		}
		p = proxy.shift();
		module.exports.proxy.loaded = proxy;
		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	//	console.log(module.exports.proxy.loaded);
		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  }
  
  return p;
};
module.exports.log =  (msg) =>{ 
    console.log(msg);
};

//module.exports.nextProxy = nextProxy;