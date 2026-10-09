import Papa from 'papaparse';

const aliases = {
  campaigns: {
    id: ['id','campaign id','campaign_id','campaign id (meta)','campaign identifier'],
    campaign_name: ['campaign name','campaign_name','campaign','name'],
    platform: ['platform','publisher platform','source platform'],
    spend: ['spend','amount spent','amount_spent','cost','amount spent (ils)','amount spent (usd)'],
    impressions: ['impressions','impression'],
    clicks: ['clicks','link clicks','outbound clicks'],
    currency: ['currency','currency code','account currency'],
    report_start: ['report start','reporting start','reporting start date','start date','date start'],
    report_end: ['report end','reporting end','reporting end date','end date','date end'],
    report_date: ['reporting date','report date','date','day']
  },
  leads: {
    id: ['id','lead id','lead_id','internal lead id','meta lead id','external id'],
    campaign_id: ['campaign id','campaign_id','campaign id (meta)','campaign external id'],
    status: ['status','lead status','lead status normalized'],
    qualification_status: ['qualification status','qualification status normalized'],
    deal_status: ['deal status','opportunity status'],
    revenue: ['revenue','deal value','deal value amount','closed value','amount'],
    response_minutes: ['response minutes','first response minutes','first response time minutes','response time minutes','first response time'],
    created_at: ['created at','lead creation date','created date','created time','lead date','date created'],
    source_type: ['source type','lead source type','lead source','source','form type']
  }
};

const required = {
  campaigns: ['id','campaign_name','platform','spend'],
  leads: ['id','campaign_id','status','revenue']
};

const normalizeHeader = value => String(value||'').replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
const cell = (row,header) => header?String(row[header]??'').trim():'';
const parse = file => new Promise((resolve,reject)=>Papa.parse(file,{
  header:true,
  skipEmptyLines:'greedy',
  transformHeader:header=>String(header).replace(/^\uFEFF/,'').trim(),
  complete:result=>{
    const errors=result.errors.filter(error=>error.code!=='TooFewFields');
    if(errors.length)reject(new Error(`CSV parse error on row ${errors[0].row+2}: ${errors[0].message}`));
    else if(!result.meta.fields?.length)reject(new Error('CSV has no header row.'));
    else resolve({headers:result.meta.fields,rows:result.data});
  },
  error:reject
}));

export async function inspectImportFiles(campaignFile,leadFile){
  if(!campaignFile||!leadFile)throw new Error('Select both CSV files.');
  if(campaignFile.size>3e6||leadFile.size>5e6)throw new Error('Files exceed MVP size limit (3 MB campaigns / 5 MB leads).');
  const [campaigns,leads]=await Promise.all([parse(campaignFile),parse(leadFile)]);
  if(campaigns.rows.length>500||leads.rows.length>10000)throw new Error('Too many rows for this MVP (500 campaigns / 10,000 leads).');
  return {
    campaigns,
    leads,
    mappings:{
      campaigns:suggestMapping(campaigns.headers,'campaigns'),
      leads:suggestMapping(leads.headers,'leads')
    }
  };
}

export function suggestMapping(headers,kind){
  const fields=aliases[kind];
  return Object.fromEntries(Object.entries(fields).map(([field,names])=>{
    const aliasesNormalized=names.map(normalizeHeader);
    const header=headers.find(candidate=>aliasesNormalized.includes(normalizeHeader(candidate)));
    return [field,header||''];
  }));
}

function parseNumber(value,label,rowNumber,{optional=false,integer=false}={}){
  if(!value&&optional)return 0;
  const raw=String(value||'').trim();
  if(!raw)throw new Error(`${label} is missing on row ${rowNumber}.`);
  let normalized=raw.replace(/[^\d,.\-]/g,'');
  const commas=(normalized.match(/,/g)||[]).length,dots=(normalized.match(/\./g)||[]).length;
  if(commas&&dots){
    if(normalized.lastIndexOf(',')>normalized.lastIndexOf('.'))normalized=normalized.replace(/\./g,'').replace(',','.');
    else normalized=normalized.replace(/,/g,'');
  }else if(commas){
    const tail=normalized.length-normalized.lastIndexOf(',')-1;
    normalized=tail===3&&normalized.indexOf(',')<=3?normalized.replace(/,/g,''):normalized.replace(',','.');
  }else if(dots>1){
    const last=normalized.lastIndexOf('.');
    normalized=normalized.slice(0,last).replace(/\./g,'')+normalized.slice(last);
  }
  const number=Number(normalized);
  if(!Number.isFinite(number)||number<0||(integer&&!Number.isInteger(number)))throw new Error(`${label} is invalid on row ${rowNumber}.`);
  return number;
}

function parseDurationMinutes(value,label,rowNumber){
  const raw=String(value||'').trim();
  if(!raw)return null;
  const clock=raw.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if(clock)return Number(clock[1])*60+Number(clock[2])+(Number(clock[3]||0)/60);
  const units=raw.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/g);
  if(units){
    return units.reduce((total,part)=>{
      const [,amount,unit]=part.match(/(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/i);
      const number=Number(amount.replace(',','.'));
      return total+number*(/^(h|hr|hrs|hour|hours)$/.test(unit)?60:/^(s|sec|secs|second|seconds)$/.test(unit)?1/60:1);
    },0);
  }
  return parseNumber(raw,label,rowNumber);
}

function parseDate(value,label,rowNumber){
  const raw=String(value||'').trim();
  if(!raw)return '';
  let match=raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if(match)return makeDate(+match[1],+match[2],+match[3],label,rowNumber);
  match=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(match){
    const first=+match[1],second=+match[2],year=+match[3];
    if(first<=12&&second<=12&&first!==second)throw new Error(`Ambiguous date "${raw}" on row ${rowNumber}. Use YYYY-MM-DD.`);
    return first>12?makeDate(year,second,first,label,rowNumber):makeDate(year,first,second,label,rowNumber);
  }
  const parsed=Date.parse(raw);
  if(!Number.isFinite(parsed))throw new Error(`${label} is not a valid date on row ${rowNumber}.`);
  return new Date(parsed).toISOString();
}

function makeDate(year,month,day,label,rowNumber){
  const date=new Date(Date.UTC(year,month-1,day));
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)throw new Error(`${label} is not a valid date on row ${rowNumber}.`);
  return date.toISOString().slice(0,10);
}

const sourceType=value=>{
  const text=String(value||'').trim().toLowerCase().replace(/[_-]+/g,' ');
  if(/instant|meta lead|facebook lead/.test(text))return 'instant_form';
  if(/website|web form|site form/.test(text))return 'website';
  return '';
};

const normalizeStatus=value=>{
  const status=String(value||'').trim().toLowerCase().replace(/[_-]+/g,' ');
  if(['new','open','created','fresh'].includes(status))return 'new';
  if(['contacted','contact','attempted','in progress','working'].includes(status))return 'contacted';
  if(['qualified','qualify','sales qualified','sql'].includes(status))return 'qualified';
  if(['unqualified','disqualified','not qualified','junk'].includes(status))return 'unqualified';
  if(['won','closed won','customer','converted'].includes(status))return 'won';
  if(['lost','closed lost'].includes(status))return 'lost';
  return '';
};

function currencyOf(row,mapping,amount){
  const explicit=cell(row,mapping.currency).toUpperCase();
  if(explicit)return explicit;
  const text=`${String(amount||'')} ${mapping.spend||''}`;
  if(/\bUSD\b|\$/.test(text))return 'USD';
  if(/\bEUR\b|€/.test(text))return 'EUR';
  if(/\bGBP\b|£/.test(text))return 'GBP';
  if(/\bILS\b|₪/.test(text))return 'ILS';
  return '';
}

function mappedValue(row,mapping,field){return cell(row,mapping[field]);}
function deduplicate(records,key,label,warnings){
  const seen=new Map(),unique=[];
  for(const record of records){
    const id=record[key];
    if(seen.has(id)){
      const previous=seen.get(id);
      if(JSON.stringify(previous)!==JSON.stringify(record))throw new Error(`Conflicting duplicate ${label} "${id}". Resolve it in the CSV before importing.`);
      continue;
    }
    seen.set(id,record);unique.push(record);
  }
  const duplicateCount=records.length-unique.length;
  if(duplicateCount)warnings.push(`${duplicateCount} identical duplicate ${label} rows will be skipped.`);
  return unique;
}

export function validateImport(bundle,mappings){
  const errors=[],warnings=[];
  const currencyMissing=bundle.campaigns.rows.some(row=>!currencyOf(row,mappings.campaigns,mappedValue(row,mappings.campaigns,'spend')));
  const campaigns=bundle.campaigns.rows.map((row,index)=>{
    const rowNumber=index+2;
    const amountText=mappedValue(row,mappings.campaigns,'spend');
    const currency=currencyOf(row,mappings.campaigns,amountText);
    if(currency&&!/^[A-Z]{3}$/.test(currency))throw new Error(`Currency "${currency}" is invalid on campaign row ${rowNumber}; use a three-letter ISO code such as USD or ILS.`);
    const reportDate=mappedValue(row,mappings.campaigns,'report_date');
    const reportStart=parseDate(mappedValue(row,mappings.campaigns,'report_start')||reportDate,'Reporting date',rowNumber);
    const reportEnd=parseDate(mappedValue(row,mappings.campaigns,'report_end')||reportDate,'Reporting date',rowNumber);
    const record={
      id:mappedValue(row,mappings.campaigns,'id'),
      campaign_name:mappedValue(row,mappings.campaigns,'campaign_name'),
      platform:mappedValue(row,mappings.campaigns,'platform'),
      spend:parseNumber(amountText,'Amount spent',rowNumber),
      impressions:parseNumber(mappedValue(row,mappings.campaigns,'impressions')||'0','Impressions',rowNumber,{optional:true,integer:true}),
      clicks:parseNumber(mappedValue(row,mappings.campaigns,'clicks')||'0','Clicks',rowNumber,{optional:true,integer:true}),
      currency:currency||'ILS',
      reporting_start:reportStart,
      reporting_end:reportEnd
    };
    if(!record.id||!record.campaign_name||!record.platform)throw new Error(`Campaign row ${rowNumber} needs an ID, campaign name and platform.`);
    if(record.reporting_start&&record.reporting_end&&record.reporting_start>record.reporting_end)throw new Error(`Reporting start is after reporting end on campaign row ${rowNumber}.`);
    return record;
  });
  const uniqueCampaigns=deduplicate(campaigns,'id','campaign',warnings);
  const campaignById=new Map(uniqueCampaigns.map(c=>[c.id,c]));
  const leads=bundle.leads.rows.map((row,index)=>{
    const rowNumber=index+2;
    const revenueText=mappedValue(row,mappings.leads,'revenue');
    const leadStatus=normalizeStatus(mappedValue(row,mappings.leads,'status'));
    const qualificationStatus=normalizeStatus(mappedValue(row,mappings.leads,'qualification_status'));
    const dealStatus=normalizeStatus(mappedValue(row,mappings.leads,'deal_status'));
    const status=['won','lost'].includes(dealStatus)?dealStatus:qualificationStatus||leadStatus;
    const record={
      id:mappedValue(row,mappings.leads,'id'),
      campaign_id:mappedValue(row,mappings.leads,'campaign_id'),
      status,
      qualification_status:qualificationStatus||leadStatus,
      deal_status:dealStatus,
      revenue:revenueText?parseNumber(revenueText,'Revenue',rowNumber):null,
      response_minutes:parseDurationMinutes(mappedValue(row,mappings.leads,'response_minutes'),'First response time',rowNumber),
      created_at:parseDate(mappedValue(row,mappings.leads,'created_at'),'Lead creation date',rowNumber)||null,
      source_type:sourceType(mappedValue(row,mappings.leads,'source_type')),
      currency:campaignById.get(mappedValue(row,mappings.leads,'campaign_id'))?.currency||'ILS'
    };
    if(!record.id||!record.campaign_id)throw new Error(`Lead row ${rowNumber} needs a stable lead ID and campaign ID.`);
    if(!record.status)throw new Error(`Lead status on row ${rowNumber} is not recognized. Use New, Contacted, Qualified, Unqualified, Won or Lost.`);
    if(!campaignById.has(record.campaign_id))throw new Error(`Lead "${record.id}" refers to campaign "${record.campaign_id}", which is not in the campaign file.`);
    return record;
  });
  const uniqueLeads=deduplicate(leads,'id','lead',warnings);
  const currencies=[...new Set(uniqueCampaigns.map(c=>c.currency).filter(Boolean))];
  if(currencies.length>1)errors.push(`Campaign data contains multiple currencies (${currencies.join(', ')}). Convert to one currency before importing; values will not be mixed.`);
  if(currencyMissing)warnings.push('Some campaign spend values have no currency code or symbol; the dashboard base currency (ILS) will be assumed.');
  if(uniqueCampaigns.some(c=>!c.reporting_start||!c.reporting_end))warnings.push('Some campaign rows have no reporting date/range. Spend cannot be reliably filtered to a custom date range for those campaigns.');
  if(uniqueLeads.some(l=>!l.created_at))warnings.push('Some leads have no creation date and will be excluded from date-filtered lead totals.');
  if(uniqueLeads.some(l=>!l.source_type))warnings.push('Some leads have no recognized source type and will appear under Unspecified source.');
  if(uniqueLeads.some(l=>l.response_minutes===null))warnings.push('Missing first-response values are excluded from average response-time calculations.');
  if(uniqueLeads.some(l=>l.status==='won'&&l.revenue===null))warnings.push('Some won leads have no deal value; total revenue and ROAS will be unavailable for affected campaigns.');
  return {campaigns:uniqueCampaigns,leads:uniqueLeads,warnings,errors,valid:errors.length===0};
}

export async function importFiles(campaignFile,leadFile,mappings){
  const bundle=await inspectImportFiles(campaignFile,leadFile);
  const result=validateImport(bundle,mappings||bundle.mappings);
  if(!result.valid)throw new Error(result.errors.join(' '));
  return result;
}
