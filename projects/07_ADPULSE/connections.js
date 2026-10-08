'use strict';
const adProviders = {
  meta: {name:'Meta Ads',mark:'∞',hint:'Facebook and Instagram campaigns',example:'123456789012345'},
  google: {name:'Google Ads',mark:'G',hint:'Search, Display and YouTube campaigns',example:'1234567890'},
  tiktok: {name:'TikTok Ads',mark:'♪',hint:'TikTok advertising campaigns',example:'1234567890123456789'}
};
let connectionService = null;
let connectionError = '';
let connectionMessage = '';
let connectionBusy = false;
let activeConnection = null;
const accountDrafts = {};
function renderConnections() {
  const container = document.querySelector('#connectionCards');
  if (!container) return;
  container.innerHTML = Object.entries(adProviders).map(([provider,info]) => {
    const ready = connectionService?.providers?.[provider]?.configured;
    const connected = activeConnection?.provider === provider && source === 'live';
    const state = connected ? 'Connected' : ready ? 'Ready to connect' : 'Setup required';
    return `<article class="panel connection-card"><div class="connection-card-heading"><span class="provider-mark ${provider}" aria-hidden="true">${info.mark}</span><span class="connection-state ${connected?'connected':''}">${t(state)}</span></div><h2 dir="ltr">${info.name}</h2><p>${t(info.hint)}</p><form data-connect-provider="${provider}"><label for="account-${provider}">${t('Advertising account ID')}</label><input id="account-${provider}" name="account" dir="ltr" inputmode="numeric" autocomplete="off" maxlength="30" placeholder="${info.example}" value="${safe(accountDrafts[provider]||'')}" required><button type="${ready?'submit':'button'}" ${ready?'':'data-connection-setup'} class="btn btn-primary" ${connectionBusy?'disabled':''}>${t(connected?'Refresh campaign data':ready?'Connect & import':'View setup instructions')}</button></form>${connected?`<div class="connection-sync">${t('Last imported')}: <bdi>${new Date(activeConnection.syncedAt).toLocaleString(uiLanguage==='he'?'he-IL':'en-US')}</bdi></div><button type="button" class="text-link" data-disconnect-provider="${provider}" ${connectionBusy?'disabled':''}>${t('Remove connection from dashboard')}</button>`:''}</article>`;
  }).join('');
  document.querySelector('#connectionServiceStatus').textContent = t(connectionService?'Local connection service is available.':'Start the local connection service to enable imports.');
  const feedback = document.querySelector('#connectionFeedback');
  feedback.textContent = connectionBusy?t('Importing campaign data…'):connectionError||t(connectionMessage);
  feedback.classList.toggle('error', Boolean(connectionError));
}
async function loadConnectionService() {
  try {
    const response = await fetch('/api/connections', {cache:'no-store',signal:AbortSignal.timeout(5000)});
    if (!response.ok) throw new Error();
    const status = await response.json();
    if (!status.providers || !status.sessionToken) throw new Error();
    connectionService = status;
  } catch { connectionService = null; }
  renderConnections();
}
function showConnectionSetup() {
  document.querySelector('#connectionSetup').open = true;
  document.querySelector('#connectionSetup').scrollIntoView({behavior:'smooth',block:'center'});
}
async function connectProvider(event) {
  const form = event.target.closest('[data-connect-provider]');
  if (!form) return;
  event.preventDefault();
  if (connectionBusy) return;
  const provider = form.dataset.connectProvider;
  const accountId = new FormData(form).get('account').trim();
  accountDrafts[provider] = accountId;
  if (!connectionService?.providers?.[provider]?.configured) { showConnectionSetup(); return; }
  connectionBusy = true; connectionError = ''; connectionMessage = ''; renderConnections();
  try {
    const response = await fetch(`/api/connections/${provider}/import`, {
      method:'POST',headers:{'Content-Type':'application/json','X-ADPULSE-Token':connectionService.sessionToken},
      body:JSON.stringify({accountId}),signal:AbortSignal.timeout(120000)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(t(data.error||'Connection failed. Check account access and server configuration.'));
    if (!Array.isArray(data.rows) || !data.rows.length) throw new Error(t('No campaign data was returned for the last 30 days.'));
    // Use the existing CSV validator before replacing the current dataset.
    const columns = ['date','campaign','channel','spend','impressions','clicks','conversions','revenue'];
    const csv = [columns.join(','),...data.rows.map(row=>columns.map(key=>csvEscape(row[key])).join(','))].join('\n');
    const imported = importCSV(csv);
    if (!/^[A-Z]{3}$/.test(data.currency)) throw new Error(t('Account currency could not be verified.'));
    rows = imported; source = 'live'; datasetCurrency = data.currency; period = 7;
    selectedCampaign = null; document.querySelector('#periodSelect').value = '7';
    activeConnection = {provider,accountId,syncedAt:Date.now()};
    renderAll();
    connectionMessage = 'Connection verified. Campaign data imported.';
  } catch(error) {
    connectionError = error.name==='TimeoutError'?t('Import timed out. Please try again.'):error.message;
  } finally { connectionBusy = false; renderConnections(); }
}
function initConnections() {
  renderConnections();
  document.querySelector('#view-connections').addEventListener('submit',connectProvider);
  document.querySelector('#view-connections').addEventListener('input',event=>{
    const form = event.target.closest('[data-connect-provider]');
    if (form) accountDrafts[form.dataset.connectProvider] = event.target.value;
  });
  document.querySelector('#connectionRetry').addEventListener('click',loadConnectionService);
  document.querySelector('#view-connections').addEventListener('click',event=>{
    if (event.target.closest('[data-connection-setup]')) showConnectionSetup();
    if (event.target.closest('[data-disconnect-provider]') && !connectionBusy) {
      activeConnection = null; rows = demoRows(); source = 'demo'; datasetCurrency = 'ILS';
      connectionMessage = ''; connectionError = '';
      period = 7; selectedCampaign = null; document.querySelector('#periodSelect').value = '7';
      renderAll();
    }
  });
  loadConnectionService();
}
