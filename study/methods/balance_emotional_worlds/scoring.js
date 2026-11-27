(function(root){
'use strict';
function score(key,answers){
 const valid=v=>Number.isInteger(v)&&v>=1&&v<=7;
 const worlds=key.worlds.map(w=>{const values=w.states.map(s=>answers[s]);const answered=values.filter(valid).length;return {name:w.name,answered,total:answered===7?values.reduce((a,b)=>a+b,0):null};});
 return {answered:key.states.filter(s=>valid(answers[s])).length,worlds};
}
if(typeof module!=='undefined')module.exports={score};else root.EmotionalWorlds={score};
})(typeof window==='undefined'?this:window);
