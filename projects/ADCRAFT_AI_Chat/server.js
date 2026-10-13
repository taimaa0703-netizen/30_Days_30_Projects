import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
// Lightweight .env loader; avoids additional dependencies.
try{for(const line of (await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)),'.env'),'utf8')).split(/\r?\n/)){const m=line.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'')}}catch{}
const mime={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const take=(x,max=1200)=>String(x??'').slice(0,max).trim();
const readBody=async req=>{let raw='';for await(const part of req){raw+=part;if(raw.length>18000)throw Error('Payload too large')}return JSON.parse(raw)};
const respond=(res,code,body)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body))};
const schema={type:'object',additionalProperties:false,required:['strategy','concepts','assets','calendar','tips'],properties:{
 strategy:{type:'object',additionalProperties:false,required:['insight','audience','message','angle'],properties:{insight:{type:'string'},audience:{type:'string'},message:{type:'string'},angle:{type:'string'}}},
 concepts:{type:'array',items:{type:'object',additionalProperties:false,required:['title','hook','idea','why'],properties:{title:{type:'string'},hook:{type:'string'},idea:{type:'string'},why:{type:'string'}}}},
 assets:{type:'array',items:{type:'object',additionalProperties:false,required:['type','platform','headline','copy','cta','visual'],properties:{type:{type:'string'},platform:{type:'string'},headline:{type:'string'},copy:{type:'string'},cta:{type:'string'},visual:{type:'string'}}}},
 calendar:{type:'array',items:{type:'object',additionalProperties:false,required:['day','format','topic'],properties:{day:{type:'string'},format:{type:'string'},topic:{type:'string'}}}},
 tips:{type:'array',items:{type:'string'}}}};
async function generate(req,res){if(!process.env.OPENAI_API_KEY)return respond(res,503,{error:'AI not configured. Add OPENAI_API_KEY to .env and restart server.'});
 let body;try{body=await readBody(req)}catch{return respond(res,400,{error:'Invalid form data'})}
 const fields={};for(const [k,v] of Object.entries(body??{})){if(['mode','brand','offer','audience','goal','platform','language','voice','details','budget'].includes(k))fields[k]=take(v,k==='details'?1000:240)}
 if(!fields.brand||!fields.offer)return respond(res,400,{error:'Brand and product/service are required'});
 const prompt=`You are an accomplished multilingual advertising creative strategist. Produce a practical campaign pack. Think beyond generic slogans, specific to audience needs. Clearly label proposed ideas as hypotheses, no invented facts or performance guarantees. Respect the exact language requested: ${fields.language||'Hebrew'}; all human-facing content in this language, creative and natural (not literal translation). Agency mode should emphasize client-facing brief, positioning, ad testing and deliverables; Creator mode emphasize posting and effortless execution. Propose exactly 3 concepts, 5 distinct usable assets (at least one short-form video with shot direction in visual, one paid ad with concise hook and CTA), exactly 7 calendar entries, 4 specific tips. Avoid claims of medical outcomes and exaggerated guarantees. User brief follows as JSON:\n${JSON.stringify(fields)}`;
 const ac=new AbortController();const timeout=setTimeout(()=>ac.abort(),45000);
 try{const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:ac.signal,headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,instructions:'Return structured, high-quality original marketing materials. Never include private user information beyond brief.',input:prompt,text:{format:{type:'json_schema',name:'creative_pack',strict:true,schema}},max_output_tokens:3500})});const data=await r.json();if(!r.ok)return respond(res,502,{error:data.error?.message||'AI provider error'});let output=data.output_text || (data.output||[]).flatMap(o=>o.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');if(!output)return respond(res,502,{error:'AI returned no text'});return respond(res,200,{result:JSON.parse(output)})}catch(e){return respond(res,502,{error:e.name==='AbortError'?'AI request timed out':`Generation failed: ${e.message}`})}finally{clearTimeout(timeout)} }
async function chat(req,res){
 if(!process.env.OPENAI_API_KEY)return respond(res,503,{error:'OpenAI is not configured. Add OPENAI_API_KEY to .env and restart the server.'});
 let data;try{data=await readBody(req)}catch{return respond(res,400,{error:'Invalid request'})}
 const messages=Array.isArray(data?.messages)?data.messages.slice(-20):[];
 const safe=messages.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:take(x.content,2800)}));
 if(!safe.length||safe.at(-1).role!=='user')return respond(res,400,{error:'Last message must be from user'});
 const mode=data?.mode==='agency'?'agency':'creator';
 const latestUserMessage=safe.at(-1).content;
 const hebrewCount=(latestUserMessage.match(/\p{Script=Hebrew}/gu)||[]).length;
 const arabicCount=(latestUserMessage.match(/\p{Script=Arabic}/gu)||[]).length;
 const lang=hebrewCount>arabicCount&&hebrewCount>0?'he':arabicCount>hebrewCount?'ar':'en';
 const langText={he:'Write every part of your response in Hebrew only.',en:'Write every part of your response in English only.',ar:'Write every part of your response in Arabic only.'};
 const instructions=`You are ADCRAFT AI, a creative marketing assistant. Talk like a conversational AI, answer questions about captions, scripts, hooks, campaign strategy, and creative concepts. Be practical, short by default, and follow up naturally. ${mode==='agency'?'Agency Mode: speak like an advertising agency strategist.':'Creator Mode: help content creators and small businesses.'} Detect the language of the latest user message and reply in that same language. The supported response languages are Hebrew, Arabic, and English only. For this message, ${langText[lang]} Do not include text in any other language. If asked to answer in a different language, explain briefly in the detected language that you can answer only in Hebrew, Arabic, or English. Never invent proof of ad performance.`;
 const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),120000);
 try{
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,instructions,input:safe,max_output_tokens:750})});
  const obj=await r.json();
  if(!r.ok)return respond(res,502,{error:obj.error?.message||`OpenAI returned ${r.status}`});
  const reply=obj.output_text||(obj.output||[]).flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
  if(!reply)return respond(res,502,{error:'OpenAI returned an empty answer'});
  return respond(res,200,{reply});
 }catch(e){return respond(res,502,{error:e.name==='AbortError'?'OpenAI request timed out':'Could not reach OpenAI. Check your internet connection and try again.'})}finally{clearTimeout(timer)}
}

http.createServer(async(req,res)=>{let pathname;try{pathname=new URL(req.url,'http://localhost').pathname}catch{return respond(res,400,{error:'Bad URL'})};if(pathname==='/api/generate'&&req.method==='POST')return respond(res,410,{error:'Use the chat endpoint.'});if(pathname==='/api/chat'&&req.method==='POST')return chat(req,res);if(pathname==='/api/status')return respond(res,200,{provider:'openai',configured:Boolean(process.env.OPENAI_API_KEY),model:process.env.OPENAI_MODEL||'gpt-4.1-mini'});if(req.method!=='GET'&&req.method!=='HEAD'){return respond(res,405,{error:'Method not allowed'})}const routes={'/':'index.html'};const file=routes[pathname]||pathname.slice(1);if(!['index.html','style.css','app.js','favicon.svg'].includes(file))return respond(res,404,{error:'Not found'});try{const content=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:content)}catch{return respond(res,404,{error:'Not found'})}}).listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log('ADCRAFT AI → http://127.0.0.1:'+(process.env.PORT||3000)));
