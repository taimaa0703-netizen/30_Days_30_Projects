const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = {};
function element() { return { textContent: '', children: [], append(...items) { this.children.push(...items); }, appendChild(item) { this.children.push(item); }, replaceChildren() { this.children = []; } }; }
const document = { documentElement: {}, getElementById(id) { return nodes[id] ??= element(); }, createElement: element };
const day = { date: '2026-10-10', start: Date.parse('2026-10-10T09:00:00Z'), end: Date.parse('2026-10-10T10:00:00Z'), steps: [{ kind: 'work', name: '<script>alert(1)</script> عربي', start: Date.parse('2026-10-10T09:00:00Z'), end: Date.parse('2026-10-10T10:00:00Z') }] };
const code = fs.readFileSync('projects/06_DoIHaveTime/share.js', 'utf8');
vm.runInNewContext(code, { document, navigator: {language:'ar'}, location: {hash:'#'+encodeURIComponent(JSON.stringify({version:1,language:'ar',timeZone:'UTC',day}))} });
assert.equal(document.documentElement.dir, 'rtl');
assert.equal(nodes.sharedSteps.children.length, 1);
assert.equal(nodes.sharedSteps.children[0].children[1].textContent, day.steps[0].name);
assert.equal(nodes.sharedSteps.children[0].children[0].textContent, `${new Date(day.start).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'UTC'})} – ${new Date(day.end).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'UTC'})}`, 'Shared times use supplied time zone');
nodes.sharedSteps.children = [];
vm.runInNewContext(code, { document, navigator: {language:'ar'}, location: {hash:'#broken'} });
assert.equal(nodes.sharedSteps.children.length, 0);
assert.ok(nodes.sharedTitle.textContent.includes('الجدول'));
console.log('PASS: Arabic shared schedule, literal event names, time zone and invalid link handling');
