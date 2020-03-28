const config = require("./config.js");
const puppeteer = require('puppeteer');

async function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function doRun(proxy,proto='http')
{
	const oldProxyUrl = proxy.ipAddress.trim() + ":" + proxy.port.trim()
	//let proxyArgs = `--proxy-server=${proto}=${oldProxyUrl}`;
	let proxyArgs = config.puppet_args.chrome_options.slice();
	proxyArgs.push(`--proxy-server=${proto}://${oldProxyUrl}`);
	//proxyArgs.push(`--proxy-server=${oldProxyUrl}`);
	console.log(proxyArgs);
   let launchOptions = { headless: config.puppet_args.chrome_headless == 'enabled'?true:false,
                          args:proxyArgs,
                        };
    const browser = await puppeteer.launch(launchOptions);
	 
	try{
		 
		const page = await browser.newPage();
		await page.setViewport({width: 1366, height: 768});
		await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
		let html = "<html><head></head><body>"
					+ "<div class=\"shot-link\">"
				+ "<a href=\"https://lc-s.co/t1T2k\" target=\"_blank\">https://lc-s.co/t1T2k</a>"
				+ "<a href=\"https://lc-s.co/Uo6GV\" target=\"_blank\">https://lc-s.co/Uo6GV</a>"
				+ "</div><script>var rnd = Math.floor(Math.random() * 6) + 1  ;rnd *= 1000;"
				+ "var monitor = setInterval(function(){"
				+ "var shortLink = document.getElementsByClassName('shot-link')[0].getElementsByTagName('a');"
				+ "if (shortLink){"
				+ "for (var i = 0; i < shortLink.length; i++){(shortLink[i]).click();}"  
				 +" clearInterval(monitor);}},100);</script></body></html>";
		await page.setContent(html);
       // await page.goto( "https://www.google.com/search?q=myip&rlz=1C1CHBD_enZA874ZA874&oq=my&aqs=chrome.0.69i59j69i57j69i59l2j69i60l2j69i61j69i60.2565j0j8&sourceid=chrome&ie=UTF-8" 
       //      ,{ waitUntil: 'networkidle0',timeout:75000 });		
		await sleep(20 * 1000);
	}catch(err)
    {
        console.log(">>>>>> LOAD ERR >>>> " + err.message);
        if ((err.message.indexOf('ERR_TUNNEL_CONNECTION_FAILED') > -1
            || err.message.indexOf('ERR_PROXY_CONNECTION_FAILED') > -1))
        {
           console.log(" ----- > ERR HTTP TUNNEL ---> CALL doRun AGAIN");
           await browser.close(); 
		 //  return;
		   if (proto == 'http')
			await doRun(proxy,'https');
		   if (proto == 'https')
			   await doRun(proxy,'socks4');
		   if (proto == 'socks4')
			   await doRun(proxy,'socks5');
        }
    }finally{
        await browser.close();
    }
}

(async()=>{
	try{
		while(true)
	    {
			config.log(config.proxy);
			let proxy = await config.nextProxy();
			console.log(" PROXY [" + JSON.stringify(proxy) + "]>>>");
			await doRun(proxy);
	    }
    }catch(err)
	{
		console.log(err.stack)
	}
})();