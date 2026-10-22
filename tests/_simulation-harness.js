'use strict';
// Integration harness: real parser, tool lookup, playback, cutting and collisions.
// Rendering/UI and ATC animation are omitted; this is NOT visual validation.
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'), read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('web/app.js'), html=read('index.html');
const start=app.indexOf("  {T:1, TYPE:");
const tools=vm.runInNewContext('['+app.slice(start,app.indexOf('\n];',start))+']');
function context(code){
 const c={console,window:{},TOOL_R:5,DEFAULT_FEED:100,probs:[],TOOL_TYPES:['MILL','DRILL','COUNTERSINK'],toolLibrary:structuredClone(tools),pFloat:v=>parseFloat(String(v).replace(',','.'))||0,
  document:{getElementById:()=>null},codeEl:{value:code},THREE_OK:false,VX:null,VX_QUALITY:1,scene:{add(){},remove(){}},blockEdges:null,blockMesh:null,currentToolNum:1,pendingToolNum:0,atcAnim:null,toolGroup:null,toolPos:{},
  activeSrcLine:-1,subIndex:0,subProgress:0,mode:'running',RAPID_MMS:100,VISUAL_GAIN:1,SPEEDS:[1],speedIdx:0,stepTargetBlock:-1,
  updateStatus(){},updatePos(){},updateSimInfoPanel(){},updateToolLegend(){},calcToolTimes(){},triggerRefine(){},highlightActiveLine(){},draw2dFull(){},startATC(){}};
 vm.createContext(c);
 for(const f of ['core/tool-table.js','core/parser-engine.js','core/voxel-cutting.js'])vm.runInContext(read(f),c,{filename:f});
 // Rendering and animation boundaries only.
 c.vxBuildMesh=()=>null;c.startATC=()=>{};c.triggerRefine=()=>{};
 c.hits=[];c.rapidCollision=(s,x,y,z)=>c.hits.push({line:s.srcLine+1,block:s.blockIndex,tool:s.toolNum,x,y,z,rapid:s.rapid,spindleOn:s.spindleOn,from:s.from,to:s.to,source:code.split('\n')[s.srcLine]});
 return c;
}
module.exports={context,read,app};
