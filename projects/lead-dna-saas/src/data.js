export const demoCampaigns = [
  { id:'c1', campaign_name:'Autumn • Broad', platform:'Meta', spend:8600, impressions:158000, clicks:4170 },
  { id:'c2', campaign_name:'Search • High Intent', platform:'Google', spend:12400, impressions:82000, clicks:3030 },
  { id:'c3', campaign_name:'Reels • Lifestyle', platform:'Meta', spend:7200, impressions:203000, clicks:5800 },
  { id:'c4', campaign_name:'Brand • Search', platform:'Google', spend:4500, impressions:43000, clicks:2130 }
];
const specs = [
  ['c1',170,29,11,143000],['c2',125,72,28,448000],['c3',205,24,6,72000],['c4',73,45,22,385000]
];
export const demoLeads = specs.flatMap(([campaign_id,total,qualified,won,revenue], ci) =>
  Array.from({length:total}, (_, i) => ({
    id: `${campaign_id}-l${i}`, campaign_id,
    status: i < won ? 'won' : i < qualified ? 'qualified' : i % 5 === 0 ? 'lost' : 'new',
    revenue: i < won ? Math.round(revenue/won) : 0,
    response_minutes: i < qualified ? 12 + (i%23) : 95 + (i%240),
    created_at: new Date(Date.now() - ((i*13 + ci*19)%30)*86400000).toISOString()
  }))
);
export const money = (n,currency='ILS') => new Intl.NumberFormat('en-IL',{style:'currency',currency,maximumFractionDigits:0}).format(Number(n)||0);
export const integer = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Number(n)||0);
export const percent = n => Number.isFinite(n) ? `${(n*100).toFixed(1)}%` : '—';
const sourceTypeOf = value => {
  const source=String(value||'').trim().toLowerCase().replace(/[_-]+/g,' ');
  if(!source)return 'unknown';
  if(source.includes('instant')||source.includes('meta form')||source.includes('facebook lead'))return 'instant_form';
  if(source.includes('website')||source.includes('web form')||source.includes('site form'))return 'website';
  return 'unknown';
};

const inDateRange = (value,start,end) => {
  if(!start&&!end)return true;
  const time=Date.parse(value);
  if(!Number.isFinite(time))return false;
  const day=new Date(time).toISOString().slice(0,10);
  return (!start||day>=start)&&(!end||day<=end);
};
const median = values => {
  const sorted=[...values].sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};

export function summarize(campaigns,leads,{start='',end=''}={}){
  const filteredLeads=leads.filter(l=>inDateRange(l.created_at,start,end));
  const rows=campaigns.map(c=>{
    const list=filteredLeads.filter(l=>l.campaign_id===c.id);
    const count=list.length,qualified=list.filter(l=>['qualified','won'].includes(l.status)).length;
    const won=list.filter(l=>l.status==='won').length;
    const wonLeads=list.filter(l=>l.status==='won');
    const revenue=wonLeads.some(l=>l.revenue===null||l.revenue==='')?null:wonLeads.reduce((n,l)=>n+(Number(l.revenue)||0),0);
    const rawSpend=Number(c.spend);
    let spend=Number.isFinite(rawSpend)?rawSpend:null;
    let spendAvailable=spend!==null;
    if(start||end){
      const reportStart=c.reporting_start||c.report_start;
      const reportEnd=c.reporting_end||c.report_end;
      if(!reportStart||!reportEnd){
        spend=null;
        spendAvailable=false;
      }else if((start&&reportEnd<start)||(end&&reportStart>end)){
        spend=0;
      }else if((start&&reportStart<start)||(end&&reportEnd>end)){
        spend=null;
        spendAvailable=false;
      }
    }
    const responseValues=list.filter(l=>l.response_minutes!==null&&l.response_minutes!=='').map(l=>Number(l.response_minutes)).filter(n=>Number.isFinite(n)&&n>=0);
    const avgResponse=responseValues.length?responseValues.reduce((n,v)=>n+v,0)/responseValues.length:null;
    return {...c,count,qualified,won,revenue,spend,spendAvailable,avgResponse,responseCount:responseValues.length,
      cpl:count&&spend!==null?spend/count:null,cpql:qualified&&spend!==null?spend/qualified:null,
      cac:won&&spend!==null?spend/won:null,roas:spend>0&&revenue!==null?revenue/spend:null,
      qualityRate:count?qualified/count:null,closeRate:count?won/count:null};
  });
  const spendComplete=rows.every(r=>r.spendAvailable);
  const total=rows.reduce((a,r)=>({
    spend:a.spend===null||r.spend===null?null:a.spend+r.spend,
    count:a.count+r.count,qualified:a.qualified+r.qualified,won:a.won+r.won,
    revenue:a.revenue===null||r.revenue===null?null:a.revenue+r.revenue
  }),{spend:0,count:0,qualified:0,won:0,revenue:0});
  const leadsInRange=filteredLeads;
  const coverage={
    totalLeads:leads.length,
    datedLeads:leads.filter(l=>Number.isFinite(Date.parse(l.created_at))).length,
    leadsInRange:leadsInRange.length,
    crmStatus:leads.filter(l=>['new','contacted','qualified','unqualified','won','lost'].includes(String(l.status||'').toLowerCase())).length,
    attributedLeads:leads.filter(l=>campaigns.some(c=>c.id===l.campaign_id)).length,
    wonLeads:leads.filter(l=>String(l.status||'').toLowerCase()==='won').length,
    wonLeadsWithRevenue:leads.filter(l=>String(l.status||'').toLowerCase()==='won'&&l.revenue!==null&&l.revenue!=='').length,
    sourcedLeads:leads.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)!=='unknown').length,
    sourceCoverage:leads.length?leads.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)!=='unknown').length/leads.length:null,
    spendComplete,
    campaignReports:campaigns.length,
    campaignReportsWithDates:campaigns.filter(c=>(c.reporting_start||c.report_start)&&(c.reporting_end||c.report_end)).length,
    missingLeadDates:leads.filter(l=>!Number.isFinite(Date.parse(l.created_at))).length,
    missingCampaignAttribution:leads.filter(l=>!campaigns.some(c=>c.id===l.campaign_id)).length
  };
  const insights=[];
  const comparable=rows.filter(r=>r.count>=20);
  const medianCpl=median(comparable.map(r=>r.cpl).filter(v=>v!==null));
  const medianCloseRate=median(comparable.map(r=>r.closeRate).filter(v=>v!==null));
  const medianSpend=median(rows.map(r=>r.spend).filter(v=>v!==null&&v>0));
  rows.forEach(r=>{
    const campaignLeads=filteredLeads.filter(l=>l.campaign_id===r.id);
    if(r.count>=20 && r.qualityRate<.2)insights.push({severity:'critical',campaign:r.campaign_name,campaignId:r.id,title:'Low lead quality',description:`Only ${percent(r.qualityRate)} of ${r.count} leads reached qualified or won status.`,evidence:`${r.qualified} of ${r.count} leads qualified or won.`,hypotheses:'Targeting, the ad promise, lead-form friction, or incomplete CRM outcomes may contribute.',action:'Audit lead source & forms'});
    if(r.count>=20 && r.responseCount>=20 && r.avgResponse>90)insights.push({severity:'warning',campaign:r.campaign_name,campaignId:r.id,title:'Slow lead follow-up',description:`Average first response is ${Math.round(r.avgResponse)} minutes.`,evidence:`Average response: ${Math.round(r.avgResponse)} minutes across ${r.responseCount} leads with response data.`,hypotheses:'Sales coverage, routing, or CRM timestamp quality may affect the observed response time.',action:'Review sales response SLA'});
    if(r.count>=20 && r.won>=5 && r.roas>=3)insights.push({severity:'positive',campaign:r.campaign_name,campaignId:r.id,title:'Strong observed revenue',description:`Observed ROAS is ${r.roas.toFixed(2)}x across ${r.won} won leads.`,evidence:`Attributed won revenue: ${money(r.revenue,r.currency)}; campaign spend: ${money(r.spend,r.currency)}.`,hypotheses:'The campaign may be reaching stronger buying intent; confirm CRM matching and sales capacity before changing budgets.',action:'Assess scale readiness'});
    if(r.count>=20&&r.won===0)insights.push({severity:'warning',campaign:r.campaign_name,campaignId:r.id,title:'Leads without closed sales',description:`${r.count} leads are associated with this campaign but none are marked won in the imported CRM data.`,evidence:`0 of ${r.count} matched leads have a Won status.`,hypotheses:'The sales cycle may be longer than the selected period, CRM outcomes may be incomplete, or leads may not be progressing.',action:'Review CRM outcomes'});
    if(medianCpl!==null&&medianCloseRate!==null&&r.count>=20&&r.cpl!==null&&r.cpl>medianCpl&&r.closeRate>medianCloseRate&&r.won>=3)insights.push({severity:'positive',campaign:r.campaign_name,campaignId:r.id,title:'Higher CPL with stronger conversion',description:'This campaign has a higher CPL and a higher lead-to-customer rate than the campaign medians.',evidence:`CPL ${money(r.cpl,r.currency)} vs median ${money(medianCpl,r.currency)}; close rate ${percent(r.closeRate)} vs median ${percent(medianCloseRate)}; ${r.won} won leads.`,hypotheses:'A higher-cost audience or channel mix may be associated with stronger intent; this comparison does not establish causality.',action:'Compare qualified customer economics'});
    if(medianSpend!==null&&r.spend!==null&&r.spend>=medianSpend&&r.spend>0&&r.roas!==null&&r.roas<1)insights.push({severity:'warning',campaign:r.campaign_name,campaignId:r.id,title:'High spend with weak observed revenue',description:`Spend is at or above the campaign median while observed revenue is below spend.`,evidence:`Spend ${money(r.spend,r.currency)}; attributed won revenue ${money(r.revenue,r.currency)}; observed ROAS ${r.roas.toFixed(2)}x.`,hypotheses:'The campaign may be underperforming, the sales cycle may be incomplete, or campaign/revenue matching may be missing.',action:'Audit spend and revenue matching'});
    const sourceRecords=campaignLeads.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='instant_form'||sourceTypeOf(l.source_type||l.lead_source_type)==='website');
    const instant=sourceRecords.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='instant_form');
    const website=sourceRecords.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='website');
    const sourceQuality=records=>records.filter(l=>['qualified','won'].includes(String(l.status||'').toLowerCase())).length/records.length;
    if(instant.length>=20&&website.length>=20&&Math.abs(sourceQuality(instant)-sourceQuality(website))>=.2)insights.push({severity:'warning',campaign:r.campaign_name,campaignId:r.id,title:'Lead-source quality gap',description:'Observed qualification rates differ between Meta Instant Forms and Website Leads for this campaign.',evidence:`Instant Forms: ${percent(sourceQuality(instant))} (${instant.length} leads); Website Leads: ${percent(sourceQuality(website))} (${website.length} leads).`,hypotheses:'Form intent, follow-up routing, or lead-source labeling may differ; the observed gap alone does not establish cause.',action:'Compare source experience and CRM handling'});
  });
  if(coverage.missingCampaignAttribution)insights.push({severity:'warning',campaign:'Data quality',title:'Missing CRM attribution',description:`${coverage.missingCampaignAttribution} imported leads do not match a campaign ID.`,evidence:`${coverage.missingCampaignAttribution} of ${coverage.totalLeads} leads have no matching campaign.`,hypotheses:'Campaign IDs may be absent, mistyped, or drawn from a different reporting account.',action:'Review unmatched lead campaign IDs'});
  return {rows,total,insights,coverage,filteredLeads,currency:campaigns[0]?.currency||'ILS'};
}

export function summarizeSources(leads,campaigns,{start='',end=''}={}){
  const filtered=leads.filter(l=>inDateRange(l.created_at,start,end));
  const groups=[
    {id:'instant_form',label:'Meta Instant Forms',records:filtered.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='instant_form')},
    {id:'website',label:'Website Leads',records:filtered.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='website')},
    {id:'unknown',label:'Unspecified source',records:filtered.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)==='unknown')}
  ];
  const summarizeGroup=group=>{
    const qualified=group.records.filter(l=>['qualified','won'].includes(String(l.status||'').toLowerCase())).length;
    const won=group.records.filter(l=>String(l.status||'').toLowerCase()==='won').length;
    const wonRecords=group.records.filter(l=>String(l.status||'').toLowerCase()==='won');
    const revenue=wonRecords.some(l=>l.revenue===null||l.revenue==='')?null:wonRecords.reduce((sum,l)=>sum+(Number(l.revenue)||0),0);
    const response=group.records.filter(l=>l.response_minutes!==null&&l.response_minutes!=='').map(l=>Number(l.response_minutes)).filter(v=>Number.isFinite(v)&&v>=0);
    return {...group,count:group.records.length,qualified,won,revenue,
      qualificationRate:group.records.length?qualified/group.records.length:null,
      avgResponse:response.length?response.reduce((a,b)=>a+b,0)/response.length:null,
      spend:null,cpl:null,cpql:null,cac:null,roas:null};
  };
  const rows=groups.map(summarizeGroup);
  const all=summarizeGroup({id:'combined',label:'Combined',records:filtered});
  all.spend=campaigns.length?null:0;
  return {rows:[...rows,all],totalLeads:leads.length,leadsInRange:filtered.length,currency:campaigns[0]?.currency||'ILS',
    sourcedLeads:leads.filter(l=>sourceTypeOf(l.source_type||l.lead_source_type)!=='unknown').length,
    sourceSpendAvailable:false};
}
