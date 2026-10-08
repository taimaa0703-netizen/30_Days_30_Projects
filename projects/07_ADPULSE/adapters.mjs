const REQUIRED = {
  meta:['META_ACCESS_TOKEN','META_CONVERSION_ACTION'],
  google:['GOOGLE_DEVELOPER_TOKEN','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'],
  tiktok:['TIKTOK_ACCESS_TOKEN','TIKTOK_ACCOUNT_CURRENCY','TIKTOK_CONVERSION_METRIC','TIKTOK_REVENUE_METRIC']
};
export function configuration(env) {
  return Object.fromEntries(Object.entries(REQUIRED).map(([provider,keys])=>[provider,{configured:keys.every(key=>Boolean(env[key]?.trim()))}]));
}
async function request(fetcher,url,options={}) {
  let response;
  try { response = await fetcher(url,{...options,signal:AbortSignal.timeout(20000)}); }
  catch { throw new Error('Platform request failed or timed out. Please try again.'); }
  let body;
  try { body = await response.json(); } catch { throw new Error('The advertising platform returned an invalid response.'); }
  if (!response.ok || body.error || (body.code !== undefined && Number(body.code)!==0)) {
    // Do not forward third-party error bodies: they may include credentials or identifiers.
    throw new Error('Connection failed. Check account access and server configuration.');
  }
  return body;
}
const value = input => {
  const n = Number(input ?? 0);
  if (!Number.isFinite(n) || n<0) throw new Error('The advertising platform returned invalid metrics.');
  return n;
};
function validCurrency(currency) {
  if (!/^[A-Z]{3}$/.test(currency||'')) throw new Error('Account currency could not be verified.');
  return currency;
}
function checkLimit(rows) { if(rows.length>50000) throw new Error('Limit: 50,000 rows per import.'); }
export function reportDates(now=new Date()) {
  const end = new Date(now); end.setUTCDate(end.getUTCDate()-1);
  const start = new Date(end); start.setUTCDate(start.getUTCDate()-29);
  return {since:start.toISOString().slice(0,10),until:end.toISOString().slice(0,10)};
}
export async function importMeta(accountId,env,fetcher=fetch,dates=reportDates()) {
  const version = env.META_API_VERSION || 'v26.0';
  if (!/^v\d+\.\d+$/.test(version)) throw new Error('Invalid API version in server configuration.');
  const base = `https://graph.facebook.com/${version}/act_${accountId}`;
  const headers = {Authorization:`Bearer ${env.META_ACCESS_TOKEN}`};
  const account = await request(fetcher,`${base}?fields=currency`,{headers});
  const currency = validCurrency(account.currency);
  const output=[];
  let after;
  const seen = new Set();
  do {
    const url = new URL(`${base}/insights`);
    const query = {fields:'campaign_id,campaign_name,date_start,spend,impressions,clicks,actions,action_values',level:'campaign',time_increment:'1',time_range:JSON.stringify(dates),limit:'500'};
    if(after) query.after=after;
    url.search = new URLSearchParams(query);
    const result = await request(fetcher,url,{headers});
    if (!Array.isArray(result.data)) throw new Error('The advertising platform returned an invalid response.');
    for (const row of result.data) {
      const action = list => value(list?.find(item=>item.action_type===env.META_CONVERSION_ACTION)?.value);
      output.push({date:row.date_start,campaign:`${row.campaign_name} [${row.campaign_id}]`,channel:'Meta',spend:value(row.spend),impressions:value(row.impressions),clicks:value(row.clicks),conversions:action(row.actions),revenue:action(row.action_values)});
    }
    checkLimit(output);
    after = result.paging?.next ? result.paging.cursors?.after : null;
    if (result.paging?.next && !after) throw new Error('The advertising platform returned invalid pagination.');
    if (after && seen.has(after)) throw new Error('The advertising platform returned invalid pagination.');
    if(after)seen.add(after);
  } while(after);
  return {rows:output,currency};
}
export async function importGoogle(accountId,env,fetcher=fetch,dates=reportDates()) {
  const auth = await request(fetcher,'https://oauth2.googleapis.com/token',{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'})
  });
  if(!auth.access_token)throw new Error('Connection failed. Check account access and server configuration.');
  const version=env.GOOGLE_API_VERSION||'v25';
  if(!/^v\d+$/.test(version))throw new Error('Invalid API version in server configuration.');
  const headers = {Authorization:`Bearer ${auth.access_token}`,'developer-token':env.GOOGLE_DEVELOPER_TOKEN,'Content-Type':'application/json'};
  if(env.GOOGLE_LOGIN_CUSTOMER_ID)headers['login-customer-id']=env.GOOGLE_LOGIN_CUSTOMER_ID.replace(/-/g,'');
  const url=`https://googleads.googleapis.com/${version}/customers/${accountId}/googleAds:searchStream`;
  const account = await request(fetcher,url,{method:'POST',headers,body:JSON.stringify({query:'SELECT customer.currency_code FROM customer LIMIT 1'})});
  const currency=validCurrency(account?.[0]?.results?.[0]?.customer?.currencyCode);
  const query=`SELECT campaign.id, campaign.name, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${dates.since}' AND '${dates.until}' ORDER BY segments.date`;
  const chunks=await request(fetcher,url,{method:'POST',headers,body:JSON.stringify({query})});
  if(!Array.isArray(chunks))throw new Error('The advertising platform returned an invalid response.');
  const output = chunks.flatMap(chunk=>(chunk.results||[]).map(row=>({date:row.segments.date,campaign:`${row.campaign.name} [${row.campaign.id}]`,channel:'Google',spend:value(row.metrics.costMicros)/1e6,impressions:value(row.metrics.impressions),clicks:value(row.metrics.clicks),conversions:value(row.metrics.conversions),revenue:value(row.metrics.conversionsValue)})));
  checkLimit(output);
  return {rows:output,currency};
}
export async function importTikTok(accountId,env,fetcher=fetch,dates=reportDates()) {
  const currency=validCurrency(env.TIKTOK_ACCOUNT_CURRENCY);
  const metricNames = [env.TIKTOK_CONVERSION_METRIC,env.TIKTOK_REVENUE_METRIC];
  if(!metricNames.every(metric=>/^[a-z_]+$/.test(metric||'')))throw new Error('Invalid metric mapping in server configuration.');
  const output=[];
  let page=1, totalPages=1;
  do {
    const url=new URL('https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/');
    url.search=new URLSearchParams({advertiser_id:accountId,report_type:'BASIC',data_level:'AUCTION_CAMPAIGN',dimensions:JSON.stringify(['campaign_id','stat_time_day']),metrics:JSON.stringify([...new Set(['campaign_name','spend','impressions','clicks',...metricNames])]),start_date:dates.since,end_date:dates.until,page:String(page),page_size:'1000'});
    const result=await request(fetcher,url,{headers:{'Access-Token':env.TIKTOK_ACCESS_TOKEN}});
    if(!Array.isArray(result.data?.list))throw new Error('The advertising platform returned an invalid response.');
    for(const row of result.data.list) {
      const metrics=row.metrics;
      // Missing configured revenue/conversion metrics must not become fabricated zeros.
      if(metrics[metricNames[0]]===undefined||metrics[metricNames[1]]===undefined)throw new Error('Configured conversion or revenue metric is unavailable. Check the server mapping.');
      output.push({date:row.dimensions.stat_time_day.slice(0,10),campaign:`${metrics.campaign_name||row.dimensions.campaign_id} [${row.dimensions.campaign_id}]`,channel:'TikTok',spend:value(metrics.spend),impressions:value(metrics.impressions),clicks:value(metrics.clicks),conversions:value(metrics[metricNames[0]]),revenue:value(metrics[metricNames[1]])});
    }
    checkLimit(output);
    totalPages=Number(result.data.page_info?.total_page||1);
    if(!Number.isInteger(totalPages)||totalPages>100)throw new Error('Limit: 50,000 rows per import.');
    page++;
  }while(page<=totalPages);
  return {rows:output,currency};
}
export const adapters={meta:importMeta,google:importGoogle,tiktok:importTikTok};
