export default `!function()%7Bvar%20e;(e=function(e)%7Breturn%20e&&e.__esModule?e:%7Bdefault:e%7D%7D).__esModule=!0,e.default=e;var%20t;(t=function(e,t)%7Bif(!(e%20instanceof%20t))throw%20new%20TypeError(%22Cannot%20call%20a%20class%20as%20a%20function%22)%7D).__esModule=!0,t.default=t;var%20n=%7B%7D;function%20r(e)%7Breturn(n=r=%22function%22==typeof%20Symbol&&%22symbol%22==typeof%20Symbol.iterator?function(e)%7Breturn%20typeof%20e%7D:function(e)%7Breturn%20e&&%22function%22==typeof%20Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?%22symbol%22:typeof%20e%7D).__esModule=!0,n.default=n,r(e)%7D(n=r).__esModule=!0,n.default=n;var%20i,o=n.default;(i=function(e,t)%7Bif(%22object%22!==o(e)%7C%7Cnull===e)return%20e;var%20n=e%5BSymbol.toPrimitive%5D;if(void%200!==n)%7Bvar%20r=n.call(e,t%7C%7C%22default%22);if(%22object%22!==o(r))return%20r;throw%20new%20TypeError(%22@@toPrimitive%20must%20return%20a%20primitive%20value.%22)%7Dreturn(%22string%22===t?String:Number)(e)%7D).__esModule=!0,i.default=i;var%20a=%7B%7D,u=n.default;(a=function(e)%7Bvar%20t=i(e,%22string%22);return%22symbol%22===u(t)?t:String(t)%7D).__esModule=!0,a.default=a;var%20l;function%20c(e,t)%7Bfor(var%20n=0;n%3Ct.length;n++)%7Bvar%20r=t%5Bn%5D;r.enumerable=r.enumerable%7C%7C!1,r.configurable=!0,%22value%22in%20r&&(r.writable=!0),Object.defineProperty(e,a(r.key),r)%7D%7D(l=function(e,t,n)%7Breturn%20t&&c(e.prototype,t),n&&c(e,n),Object.defineProperty(e,%22prototype%22,%7Bwritable:!1%7D),e%7D).__esModule=!0,l.default=l;var%20f=e(t),s=e(l),v=function()%7Bfunction%20e(t)%7B(0,f.default)(this,e),this.dicChannel=%7B%7D%7Dreturn(0,s.default)(e,%5B%7Bkey:%22log%22,value:function()%7Btry%7Bthis.emit(%22cw.log%22,arguments)%7Dcatch(t)%7Bvar%20e=%22error%20when%20log%20with%20Input:%20%22+arguments%5B0%5D;window.ReactNativeWebView.postMessage(e)%7D%7D%7D,%7Bkey:%22emit%22,value:function(e,t,n)%7Btry%7Bvar%20r=uuid.v4();n&&(this.dicChannel%5Be%5D?this.dicChannel%5Be%5D%5Br%5D=%7BresolveFunc:n%7D:(this.dicChannel%5Be%5D=%7B%7D,this.dicChannel%5Be%5D%5Br%5D=%7BresolveFunc:n%7D));var%20i=%7Bchannel:e,params:t%7D;window.ReactNativeWebView.postMessage(JSON.stringify(i))%7Dcatch(o)%7Bcw.log(%22error%20when%20emit%20params%20with%20Input:%20%22,e,t)%7D%7D%7D,%7Bkey:%22onMesasge%22,value:function(e,t)%7Bvar%20n=this;try%7Bvar%20r=this.dicChannel%5Be%5D;_.forEach(r,function(r,i)%7Bvar%20o=t&&JSON.parse(JSON.stringify(t));r.resolveFunc(o),delete%20n.dicChannel%5Be%5D%5Bi%5D%7D)%7Dcatch(i)%7Bcw.log(%22error%20when%20onMesasge%20with%20Input%22,e,t)%7D%7D%7D,%7Bkey:%22error%22,value:function()%7B%7D%7D%5D),e%7D();cw=new%20v;var%20h=e(t),d=e(l),y=function()%7Bfunction%20e()%7B(0,h.default)(this,e)%7Dreturn(0,d.default)(e,%5B%7Bkey:%22convertCsvToObject%22,value:function(e,t)%7Bvar%20n=t.startLine,r=t.endLine;if(!e%7C%7Cn%3Cr%7C%7Cn%3C1)return%20null;var%20i=e.split(%22%5C%5Cn%22),o=n?n-1:0,a=r%7C%7Ci.length,u=i.slice(o,a);return%20this.convertLineStringToObject(u)%7D%7D,%7Bkey:%22convertLineStringToObject%22,value:function()%7Bvar%20e=arguments.length%3E0&&void%200!==arguments%5B0%5D?arguments%5B0%5D:%5B%5D;try%7Bfor(var%20t=%5B%5D,n=e%5B0%5D.split(%22,%22),r=1;r%3Ce.length;r++)%7Bvar%20i=e%5Br%5D.split(%22,%22);if(i.length===n.length)%7Bfor(var%20o=%7B%7D,a=0;a%3Ci.length;a++)%7Bvar%20u=n%5Ba%5D,l=i%5Ba%5D;o%5Bu%5D=l%7Dt.push(o)%7D%7Dreturn%20t%7Dcatch(c)%7Breturn%7B%7D%7D%7D%7D,%7Bkey:%22getIndex%22,value:function(e)%7Bvar%20t=_.split(e,%22Time,Open,High,Low,Close,Volume%22)%5B0%5D;return%20_.size(_.split(t,%22%5C%5Cn%22))%7D%7D,%7Bkey:%22getCurrentTimezone%22,value:function()%7Breturn-1*(new%20Date).getTimezoneOffset()/60%7D%7D,%7Bkey:%22handleOneCSV%22,value:function(e)%7Bvar%20t=this;if(e&&%22string%22==typeof%20e)%7Bvar%20n=this.convertCsvToObject(e,%7BstartLine:this.getIndex(e)%7D);if(_.size(n)%3C1)return%20null;var%20r=%7B%7D;return%20_.forEach(n,function(e)%7Bvar%20n=e.Time,i=e.Open,o=e.High,a=e.Close,u=e.Volume,l=e.Low,c=36e5*t.getCurrentTimezone(),f=moment(n,%5B%22DD/MM/YY%20HH:mm:ss.SSS%22%5D).valueOf()+c;f&&(r%5Bf%5D=%7Bupdated:f,open:i,high:o,close:a,volume:u,low:l%7D)%7D),r%7D%7D%7D,%7Bkey:%22handleData%22,value:function(e)%7Bvar%20t=this,n=%7B%7D;if(e&&%22string%22==typeof%20e)%7Bvar%20r=_.split(e,%22Symbol,%22);_.forEach(r,function(e)%7Bvar%20r=_.trim(e);if(r)%7Bvar%20i=_.split(r,%22%5C%5Cn%22)%5B0%5D;r=%22Symbol,%22+r;var%20o=t.handleOneCSV(r);o&&(n%5Bi%5D=o)%7D%7D)%7Dcw.emit(%22chart.handleData%22,n)%7D%7D%5D),e%7D();chart=new%20y%7D();`