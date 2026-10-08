import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {adapters,configuration} from './adapters.mjs';

// Local, single-user service. Credentials are read only by the Node process.
try { process.loadEnvFile(fileURLToPath(new URL('.env',import.meta.url))); }
catch(error) { if(error.code!=='ENOENT')throw error; }
const port=Number(process.env.PORT||3070);
const sessionToken=randomBytes(32).toString('hex');
const files={
  '/':['index.html','text/html; charset=utf-8'],
  '/index.html':['index.html','text/html; charset=utf-8'],
  '/styles.css':['styles.css','text/css; charset=utf-8'],
  '/app.js':['app.js','text/javascript; charset=utf-8'],
  '/i18n.js':['i18n.js','text/javascript; charset=utf-8'],
  '/auth.js':['auth.js','text/javascript; charset=utf-8'],
  '/report.js':['report.js','text/javascript; charset=utf-8'],
  '/connections.js':['connections.js','text/javascript; charset=utf-8']
};
function json(response,status,body){response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(JSON.stringify(body));}
function permittedToken(token) {
  if(typeof token!=='string')return false;
  const a=Buffer.from(token),b=Buffer.from(sessionToken);
  return a.length===b.length&&timingSafeEqual(a,b);
}
async function bodyJSON(request) {
  let text='';
  for await(const chunk of request){text+=chunk;if(Buffer.byteLength(text)>12288)throw new Error('Request is too large.');}
  try{return JSON.parse(text);}catch{throw new Error('Invalid request.');}
}
let importing=false;
export const server=http.createServer(async(request,response)=>{
  const host=request.headers.host;
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(host))return json(response,403,{error:'Local access only.'});
  const origin=request.headers.origin;
  if(origin&&origin!==`http://${host}`)return json(response,403,{error:'Local access only.'});
  const url=new URL(request.url,`http://${host}`);
  try {
    if(url.pathname==='/api/connections'&&request.method==='GET')return json(response,200,{providers:configuration(process.env),sessionToken});
    const match=url.pathname.match(/^\/api\/connections\/(meta|google|tiktok)\/import$/);
    if(match){
      if(request.method!=='POST')return json(response,405,{error:'Method not allowed.'});
      if(!permittedToken(request.headers['x-adpulse-token']))return json(response,403,{error:'Reload the page and try again.'});
      const provider=match[1];
      if(!configuration(process.env)[provider].configured)return json(response,409,{error:'Server credentials are not configured for this platform.'});
      if(importing)return json(response,429,{error:'An import is already running. Please wait.'});
      const body=await bodyJSON(request);
      const accountId=String(body.accountId||'').replace(/-/g,'').replace(/^act_/,'');
      if(!/^\d{5,25}$/.test(accountId))return json(response,400,{error:'Enter a valid advertising account ID.'});
      if(provider==='google'&&accountId.length!==10)return json(response,400,{error:'Google Ads customer IDs must contain 10 digits.'});
      importing=true;
      try {
        const report=await adapters[provider](accountId,process.env);
        if(!report.rows.length)return json(response,422,{error:'No campaign data was returned for the last 30 days.'});
        return json(response,200,report);
      }finally{importing=false;}
    }
    if(url.pathname.startsWith('/api/'))return json(response,404,{error:'Not found.'});
    if(!['GET','HEAD'].includes(request.method))return json(response,405,{error:'Method not allowed.'});
    const file=files[url.pathname];
    if(!file)return json(response,404,{error:'Not found.'});
    const contents=await readFile(new URL(file[0],import.meta.url));
    response.writeHead(200,{'Content-Type':file[1],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
    response.end(request.method==='HEAD'?undefined:contents);
  }catch(error){
    const publicErrors=new Set(['Request is too large.','Invalid request.','Platform request failed or timed out. Please try again.','The advertising platform returned an invalid response.','Connection failed. Check account access and server configuration.','The advertising platform returned invalid metrics.','Account currency could not be verified.','Limit: 50,000 rows per import.','The advertising platform returned invalid pagination.','Invalid API version in server configuration.','Invalid metric mapping in server configuration.','Configured conversion or revenue metric is unavailable. Check the server mapping.']);
    json(response,502,{error:publicErrors.has(error.message)?error.message:'Import failed. Check server configuration and try again.'});
  }
});
server.requestTimeout=125000;
server.listen(port,'127.0.0.1',()=>console.log(`ADPULSE: http://127.0.0.1:${port}`));
