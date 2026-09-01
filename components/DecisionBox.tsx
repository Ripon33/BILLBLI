"use client";
import {useState} from "react";
export function DecisionBox(){
 const [question,setQuestion]=useState("");
 const [result,setResult]=useState<any>(null);
 const [busy,setBusy]=useState(false);
 async function run(){
  if(!question.trim()) return;
  setBusy(true); setResult(null);
  try{
   const r=await fetch("/api/research",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question})});
   setResult(await r.json());
  }finally{setBusy(false)}
 }
 return <div className="mt-10">
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
   <textarea value={question} onChange={e=>setQuestion(e.target.value)} className="w-full min-h-32 resize-none outline-none text-lg" placeholder="What decision are you making?"/>
   <div className="border-t pt-4 flex justify-end">
    <button onClick={run} disabled={busy} className="bg-emerald-600 disabled:opacity-50 text-white rounded-lg px-5 py-3 font-bold">{busy?"Researching…":"Research & Decide →"}</button>
   </div>
  </div>
  {result && <pre className="mt-5 whitespace-pre-wrap bg-slate-950 text-slate-100 rounded-2xl p-6 overflow-auto">{JSON.stringify(result,null,2)}</pre>}
 </div>
}