import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {configuration,reportDates,importMeta,importGoogle,importTikTok} from './adapters.mjs';

const dates={since:'2026-09-08',until:'2026-10-07'};
function mockResponses(responses,calls=[]) {
  return async(url,options)=>{
    calls.push({url:String(url),options});
    assert.ok(responses.length,'Unexpected upstream request');
    const next=responses.shift();
    return {ok:next.ok!==false,json:async()=>next.body};
  };
}
test('credentials missing means setup required, not connected',()=>{
  assert.deepEqual(configuration({}),{meta:{configured:false},google:{configured:false},tiktok:{configured:false}});
  assert.equal(configuration({META_ACCESS_TOKEN:'secret',META_CONVERSION_ACTION:'purchase'}).meta.configured,true);
});
test('30 completed dates exclude the current day',()=>{
  assert.deepEqual(reportDates(new Date('2026-10-08T12:00:00Z')),dates);
});
test('Meta pagination stays on the platform host and counts only configured action',async()=>{
  const calls=[];
  const report=await importMeta('12345',{META_ACCESS_TOKEN:'private',META_CONVERSION_ACTION:'purchase'},mockResponses([
    {body:{currency:'USD'}},
    {body:{data:[{campaign_id:'1',campaign_name:'Sample',date_start:'2026-10-07',spend:'25',impressions:'100',clicks:'10',actions:[{action_type:'purchase',value:'2'},{action_type:'omni_purchase',value:'2'}],action_values:[{action_type:'purchase',value:'70'}]}],paging:{next:'https://untrusted.example/?access_token=private',cursors:{after:'cursor'}}}},
    {body:{data:[]}}
  ],calls),dates);
  assert.equal(report.currency,'USD');assert.equal(report.rows[0].conversions,2);assert.equal(report.rows[0].revenue,70);
  assert.equal(new URL(calls[2].url).hostname,'graph.facebook.com');
  assert.equal(new URL(calls[2].url).searchParams.get('after'),'cursor');
  assert.ok(!calls.some(call=>call.url.includes('private')));
});
test('Google refreshes OAuth credentials and normalizes micros and currency',async()=>{
  const calls=[];
  const report=await importGoogle('1234567890',{GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'private',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_DEVELOPER_TOKEN:'dev',GOOGLE_LOGIN_CUSTOMER_ID:'111-222-3333'},mockResponses([
    {body:{access_token:'access'}},
    {body:[{results:[{customer:{currencyCode:'EUR'}}]}]},
    {body:[{results:[{campaign:{id:'2',name:'Search'},segments:{date:'2026-10-07'},metrics:{costMicros:'12500000',impressions:'120',clicks:'20',conversions:2.5,conversionsValue:90}}]}]}
  ],calls),dates);
  assert.equal(report.rows[0].spend,12.5);assert.equal(report.rows[0].conversions,2.5);assert.equal(report.currency,'EUR');
  assert.equal(calls[1].options.headers['login-customer-id'],'1112223333');
  assert.ok(JSON.parse(calls[2].options.body).query.includes("BETWEEN '2026-09-08' AND '2026-10-07'"));
});
test('TikTok paginates and honors configured objective metrics',async()=>{
  const env={TIKTOK_ACCESS_TOKEN:'private',TIKTOK_ACCOUNT_CURRENCY:'ILS',TIKTOK_CONVERSION_METRIC:'conversion',TIKTOK_REVENUE_METRIC:'purchase_value'};
  const calls=[];
  const report=await importTikTok('12345',env,mockResponses([
    {body:{code:0,data:{list:[{dimensions:{campaign_id:'3',stat_time_day:'2026-10-07 00:00:00'},metrics:{campaign_name:'Video',spend:'20',impressions:'200',clicks:'5',conversion:'1',purchase_value:'50'}}],page_info:{total_page:2}}}},
    {body:{code:0,data:{list:[],page_info:{total_page:2}}}}
  ],calls),dates);
  assert.equal(report.rows[0].revenue,50);assert.equal(report.rows[0].date,'2026-10-07');assert.equal(calls.length,2);
  assert.equal(new URL(calls[1].url).searchParams.get('page'),'2');
  assert.equal(calls[0].options.headers['Access-Token'],'private');
});
test('TikTok missing revenue does not become a fabricated zero',async()=>{
  await assert.rejects(importTikTok('12345',{TIKTOK_ACCESS_TOKEN:'private',TIKTOK_ACCOUNT_CURRENCY:'USD',TIKTOK_CONVERSION_METRIC:'conversion',TIKTOK_REVENUE_METRIC:'value'},mockResponses([{body:{code:0,data:{list:[{dimensions:{},metrics:{conversion:1}}]}}}]),dates),/metric is unavailable/);
});
test('upstream errors do not reveal secret-bearing error messages',async()=>{
  await assert.rejects(importMeta('12345',{META_ACCESS_TOKEN:'private'},mockResponses([{ok:false,body:{error:{message:'secret=private'}}}]),dates),error=>!error.message.includes('private')&&error.message.includes('Connection failed'));
});

async function frontend() {
  const nodes=new Map();
  const node=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{textContent:'',innerHTML:'',value:selector==='#channelFilter'?'all':'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){}});
    return nodes.get(selector);
  };
  const context=vm.createContext({console,AbortSignal,localStorage:{getItem:()=>null},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},FormData:class {get(){return '1234567890';}}});
  for(const file of ['i18n.js','app.js','connections.js'])vm.runInContext(await readFile(new URL(file,import.meta.url),'utf8'),context);
  vm.runInContext('rows=demoRows();renderAll();connectionService={providers:{meta:{configured:true}},sessionToken:"local"};',context);
  context.event={preventDefault(){},target:{closest:()=>({dataset:{connectProvider:'meta'}})}};
  return {context,nodes};
}
test('successful browser import replaces demo, preserves account currency and shows verified status',async()=>{
  const {context,nodes}=await frontend();
  context.fetch=async()=>({ok:true,json:async()=>({currency:'USD',rows:[{date:'2026-10-07',campaign:'Live [1]',channel:'Meta',spend:25,impressions:100,clicks:10,conversions:2,revenue:70}]})});
  await vm.runInContext('connectProvider(event)',context);
  assert.equal(vm.runInContext('source',context),'live');
  assert.equal(vm.runInContext('datasetCurrency',context),'USD');
  assert.equal(vm.runInContext('activeConnection.provider',context),'meta');
  assert.ok(nodes.get('#connectionCards').innerHTML.includes('Connected'));
  assert.ok(nodes.get('#connectionFeedback').textContent.includes('verified'));
  vm.runInContext("uiLanguage='he';renderAll()",context);
  assert.ok(nodes.get('#connectionCards').innerHTML.includes(vm.runInContext("t('Connected')",context)));
});
test('failed browser import preserves existing data and does not mark the account connected',async()=>{
  const {context,nodes}=await frontend();
  const count=vm.runInContext('rows.length',context);
  context.fetch=async()=>({ok:false,json:async()=>({error:'Connection failed. Check account access and server configuration.'})});
  await vm.runInContext('connectProvider(event)',context);
  assert.equal(vm.runInContext('rows.length',context),count);
  assert.equal(vm.runInContext('source',context),'demo');
  assert.equal(vm.runInContext('activeConnection',context),null);
  assert.ok(nodes.get('#connectionFeedback').textContent.includes('Connection failed'));
});
