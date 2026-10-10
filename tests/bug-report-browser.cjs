// Run with PLAYWRIGHT_MODULE pointing to an installed playwright-core module.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const [port,repo] of [[8000,'tnc-sim'],[8001,'tnc-sim-android']]){
   const context=await browser.newContext({viewport:{width:1280,height:1000},acceptDownloads:true});
   const page=await context.newPage();
   page.setDefaultTimeout(10000);
   console.log('Opening',repo);
   let reportPosts=0;
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/api/report') reportPosts++;
    if(url.hostname!=='127.0.0.1') return route.abort();
    return route.continue();
   });
   await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});
   console.log('Loaded',repo);
   await page.waitForFunction(()=>typeof openBugReport==='function');
   await page.evaluate(()=>{
    window.__githubDrafts=[];
    window.open=url=>{window.__githubDrafts.push(url);return null;};
   });
   for(const kind of ['bug','suggest']){
    await page.evaluate(kind=>openBugReport(kind),kind);
    await page.locator('#bugOverlay.open').waitFor();
    assert(await page.locator('#bugSendBtn').isDisabled());
    assert(await page.locator('#bugEmailBtn').isDisabled());
    await page.locator('#bugDesc').fill('Functional test: ž & ? 😀');
    await page.locator('#bugSendBtn').click();
    console.log('GitHub draft clicked',repo,kind);
    let draft=new URL(await page.evaluate(()=>window.__githubDrafts.at(-1)));
    assert.equal(draft.pathname,`/slavomrkva/${repo}/issues/new`);
    assert(draft.searchParams.get('body').includes('Functional test: ž & ? 😀'));
    assert.equal(draft.searchParams.get('body').includes('## Program'),kind==='bug');
    await page.locator('#bugEmailBtn').click({noWaitAfter:true});
    console.log('Email draft clicked',repo);
    draft=new URL(await page.locator('#bugStatus a').getAttribute('href'));
    assert.equal(draft.protocol,'mailto:');assert.equal(draft.pathname,'info@tncsim.org');
    assert(draft.searchParams.get('body').includes('Functional test'));
    await page.evaluate(()=>closeBugReport());
   }
   await page.evaluate(()=>{openBugReport('bug');document.getElementById('code').value='L X+10 Y+20 😀\n'.repeat(1000);});
   await page.locator('#bugDesc').fill('Large report');
   await page.locator('#bugEmailBtn').click({noWaitAfter:true});
    console.log('Email draft clicked',repo);
   assert((await page.locator('#bugStatus').textContent()).includes('shortened'));
   assert((await page.locator('#bugStatus a').getAttribute('href')).length<=1800);
   if(repo==='tnc-sim'){
    const waiting=page.waitForEvent('download');
    await page.locator('#bugDownloadBtn').click();
    const download=await waiting;
    assert.equal(download.suggestedFilename(),'tnc-sim-report.txt');
    const stream=await download.createReadStream();let content='';
    for await(const part of stream) content+=part.toString();
    assert(content.includes('Large report'));assert(content.includes('L X+10 Y+20 😀\n'.repeat(1000)));
   } else {
    // Browser preview has no Android OS; exercise the existing plugin adapter.
    await page.evaluate(()=>{
     window.__nativeCalls=[];
     window.Capacitor={Plugins:{Filesystem:{writeFile:async options=>{window.__nativeCalls.push(options);return {uri:'file:///cache/tnc-sim-report.txt'};}},Share:{share:async options=>{window.__nativeCalls.push(options);}}}};
    });
    await page.locator('#bugDownloadBtn').click();
    await page.waitForFunction(()=>window.__nativeCalls.length===2);
    const calls=await page.evaluate(()=>window.__nativeCalls);
    assert(calls[0].data.includes('L X+10 Y+20 😀\n'.repeat(1000)));
    assert.equal(calls[1].url,'file:///cache/tnc-sim-report.txt');
   }
   assert.equal(reportPosts,0);
   const artifactDir=process.env.REPORT_ARTIFACT_DIR || '/tmp/tnc-sim-report-tests';
   fs.mkdirSync(artifactDir,{recursive:true});
   await page.screenshot({path:path.join(artifactDir,`${repo}-bug-report.png`)});
   console.log(`PASS ${repo}: actual dialog, required input, GitHub/email drafts, long-report warning, complete export, no reporting POST`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
