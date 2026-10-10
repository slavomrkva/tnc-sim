const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const android = fs.existsSync(path.join(__dirname, '..', 'www', 'core', 'bug-report.js'));
const sourcePath = path.join(__dirname, '..', android ? 'www/core/bug-report.js' : 'core/bug-report.js');
const classes = new Set();
const classList = {add:n=>classes.add(n),remove:n=>classes.delete(n),toggle(){}};
const elements = {};
for(const id of ['bugOverlay','bugStatus','bugSendBtn','bugEmailBtn','bugDownloadBtn','bugDesc','bugChoiceProblem','bugChoiceSuggest','bugWarn','code']){
 elements[id]={classList,style:{},dataset:{},value:'',focus(){},appendChild(node){(this.children ||= []).push(node);}};
}
elements.code.value='BEGIN PGM TEST MM\nEND PGM TEST MM';
const opened=[];const downloads=[];
const context={APP_VERSION:'test',problemsData:[{line:0,sev:'err',msg:'Example error'}],_bugErrors:['Example JS error'],document:{body:{getAttribute(){return null;}},getElementById:id=>elements[id],createElement:()=>({}),createTextNode:text=>({textContent:text})},navigator:{userAgent:'test',platform:'test',maxTouchPoints:0,language:'en'},window:{screen:{width:100,height:100},devicePixelRatio:1,location:{href:''},open:(...args)=>{opened.push(args);return null;}},setTimeout:f=>f(),console,_downloadTextFile:(...args)=>downloads.push(args),fetch:()=>{throw Error('Reporting must not call a server');}};
vm.createContext(context);vm.runInContext(fs.readFileSync(sourcePath,'utf8'),context);
for(const kind of ['bug','suggest']){
 context.openBugReport(kind);
 assert.equal(elements.bugDesc.value,'');
 assert(elements.bugSendBtn.disabled && elements.bugEmailBtn.disabled);
 const before=opened.length;
 context.sendReport();assert.equal(opened.length,before);
 elements.bugDesc.value='Example & details? ž 😀';context._bugUpdateSendState();
 assert(!elements.bugSendBtn.disabled && !elements.bugEmailBtn.disabled);
 context.sendReport();
 const url=new URL(opened.at(-1)[0]);
 assert.equal(url.hostname,'github.com');
 assert.equal(url.pathname,android?'/slavomrkva/tnc-sim-android/issues/new':'/slavomrkva/tnc-sim/issues/new');
 assert(url.searchParams.get('body').includes(elements.bugDesc.value));
 assert.equal(url.searchParams.get('body').includes('BEGIN PGM'),kind==='bug');
 assert.equal(url.searchParams.get('body').includes('Example error'),kind==='bug');
 assert.equal(url.searchParams.get('labels'),kind==='bug'?'bug':'enhancement');
 context.sendReport('email');const email=new URL(opened.at(-1)[0]);
 assert.equal(email.protocol,'mailto:');assert.equal(email.pathname,'info@tncsim.org');
 assert(email.searchParams.get('body').includes(elements.bugDesc.value));
 assert(!elements.bugStatus.textContent.includes('posted'));
 context.downloadBugReport();assert(downloads.at(-1)[0].includes(elements.bugDesc.value));
 context.closeBugReport();assert(!classes.has('open'));
}
context.openBugReport('bug');elements.bugDesc.value='Long report';elements.code.value='😀 XYZ'.repeat(10000);
for(const channel of ['github','email']){
 const draft=context._bugDeliveryUrl(channel);
 assert(draft.truncated);assert(draft.url.length <= (channel==='email'?1800:7000));
 assert(new URL(draft.url).searchParams.get('body').includes('Report shortened'));
}
context.downloadBugReport();assert(downloads.at(-1)[0].includes(elements.code.value));
elements.bugDesc.value='x'.repeat(79)+'😀';
assert.doesNotThrow(()=>context._bugDeliveryUrl('github'));
const html=fs.readFileSync(path.join(__dirname,'..',android?'www/index.html':'index.html'),'utf8');
assert(html.includes('id="bugEmailBtn"'));assert(!html.includes('turnstile/v0'));
console.log('Token-free GitHub, email, Unicode, long-report export and dialog checks passed');
