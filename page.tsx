import { DecisionBox } from "@/components/DecisionBox";
export default function Home(){
 return <main className="min-h-screen bg-[#f5f7f8] text-[#101719]">
  <nav className="border-b bg-white px-8 py-5 flex justify-between">
   <div className="font-black text-xl"><span className="mr-2 inline-grid place-items-center w-8 h-8 rounded-lg bg-emerald-600 text-white">B</span>BILLBLI</div>
   <span className="text-xs text-slate-500">DECISION INTELLIGENCE</span>
  </nav>
  <section className="max-w-5xl mx-auto px-6 py-20">
   <div className="uppercase text-emerald-700 text-xs font-bold tracking-[.18em] mb-3">BILLBLI</div>
   <h1 className="text-5xl font-black tracking-tight max-w-3xl">Research deeper. Decide better.</h1>
   <p className="mt-5 text-lg text-slate-600 max-w-2xl">Turn complex questions into evidence-backed decisions with research, source verification and transparent decision factors.</p>
   <DecisionBox/>
  </section>
 </main>
}