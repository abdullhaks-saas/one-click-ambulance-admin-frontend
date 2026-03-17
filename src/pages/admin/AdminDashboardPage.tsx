import {
  Ambulance,
  TrendingUp,
  Activity,
  ChevronDown,
  MoreHorizontal,
  Phone,
  DollarSign,
  Users,
  Timer
} from 'lucide-react';
import { DashboardMap } from '@/components/map/DashboardMap';

/** Dummy dashboard metrics (backend API returns real data when ready) */
const DUMMY_METRICS = {
  total_rides_today: 132,
  active_drivers: 32,
  completed_rides: 872,
  total_revenue: 12450,
  driver_utilization_rate: 84, // percentage
  avg_response_time: 14, // minutes
  total_drivers: 85,
};

export function AdminDashboardPage() {

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 text-foreground">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Stat 1: Total rides today */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">total rides today</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-black dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-lg shadow-black/10">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black dark:text-white">{DUMMY_METRICS.total_rides_today}</span>
                <span className="text-xs font-semibold text-green-500 flex items-center">↑ 25%</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-12 flex items-end gap-1 opacity-40">
            <div className="w-full bg-zinc-200 dark:bg-slate-700 rounded-t-sm h-[30%]"></div>
            <div className="w-full bg-zinc-200 dark:bg-slate-700 rounded-t-sm h-[60%]"></div>
            <div className="w-full bg-black dark:bg-slate-300 rounded-t-sm h-[90%]"></div>
          </div>
        </div>

        {/* Stat 2: Active drivers */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">active drivers</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-black dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-lg shadow-black/10">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black dark:text-white">{DUMMY_METRICS.active_drivers}</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-12 flex items-end gap-1 px-1 opacity-40">
             <div className="w-full border-r-2 border-dashed border-zinc-400 dark:border-slate-600 h-1/2"></div>
             <div className="w-full border-r-2 border-dashed border-black dark:border-white h-3/4"></div>
          </div>
        </div>

        {/* Stat 3: Completed rides */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">completed rides</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-black dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-lg shadow-black/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black dark:text-white">{DUMMY_METRICS.completed_rides}</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-12 flex items-center justify-center opacity-40">
             <svg viewBox="0 0 100 50" className="w-full h-full stroke-black dark:stroke-white stroke-2 fill-none">
               <path d="M0,40 L20,30 L40,45 L60,15 L80,25 L100,5" strokeLinecap="round" strokeLinejoin="round" />
               <circle cx="100" cy="5" r="4" className="fill-black dark:fill-white" />
             </svg>
          </div>
        </div>

        {/* Stat 4: Total revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">total revenue</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/10">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-black dark:text-white">${DUMMY_METRICS.total_revenue.toLocaleString()}</span>
                <span className="text-xs font-semibold text-green-500 flex items-center">↑ 8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 5: Driver utilization rate */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">driver utilization</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black dark:text-white">{DUMMY_METRICS.driver_utilization_rate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 6: Average response time */}
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3">avg response time</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/10">
                <Timer className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black dark:text-white">{DUMMY_METRICS.avg_response_time}</span>
                <span className="text-sm font-semibold text-zinc-500">mins</span>
                <span className="text-xs font-semibold text-green-500 flex items-center ml-1">↓ 2m</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Stats & Details) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Patient Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex-1">
            <h3 className="text-lg font-bold text-black dark:text-white mb-1">active request details</h3>
            <p className="text-xs text-zinc-400 mb-6">critical care / in progress</p>
            
            <div className="flex items-center justify-between mb-8">
              <div className="text-center">
                <p className="text-xl font-bold text-black dark:text-white">28 min</p>
                <p className="text-xs text-zinc-500">ETA</p>
              </div>
              <div className="h-8 w-px bg-zinc-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <p className="text-xl font-bold text-black dark:text-white">10.2 km</p>
                <p className="text-xs text-zinc-500">distance</p>
              </div>
              <div className="h-8 w-px bg-zinc-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <p className="text-xl font-bold text-black dark:text-white">A+</p>
                <p className="text-xs text-zinc-500">blood</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-black dark:text-white mb-4">patient / caller</h4>
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-slate-800/50 rounded-2xl p-3 ring-1 ring-zinc-100 dark:ring-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-slate-700 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=mike" alt="Caller" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">mike miles</p>
                  <p className="text-xs text-zinc-500">+1 800 456 2456</p>
                </div>
              </div>
              <button className="h-10 w-10 rounded-full bg-[#e8f1ff] dark:bg-blue-900/30 hover:bg-[#d0e3ff] transition-colors flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats / Speed Card */}
          <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex-1 flex flex-col">
             <h3 className="text-lg font-bold text-black dark:text-white mb-6">fleet statistics</h3>
             
             <div className="flex items-center gap-6 mb-6 px-2 justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                  <span className="text-xs font-medium text-zinc-500">total: {DUMMY_METRICS.total_drivers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-zinc-500">active: {DUMMY_METRICS.active_drivers}</span>
                </div>
             </div>

             <div className="flex-1 flex items-center justify-center relative">
                {/* Simulated Donut Chart */}
                <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-zinc-100 dark:text-slate-800" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100.48" strokeLinecap="round" className="text-black dark:text-slate-200" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="220" strokeLinecap="round" className="origin-center rotate-[216deg]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-black dark:text-white">65</span>
                  <span className="text-xs font-semibold text-zinc-400">avg km/h</span>
                </div>
             </div>
          </div>

        </div>

        {/* Middle Column (Tracking & Info) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tracking Ticket */}
          <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex-1 overflow-hidden flex flex-col relative">
            <div className="p-6 bg-red-500 text-white relative overflow-hidden">
               <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                 <Ambulance className="h-48 w-48" />
               </div>
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold">trip info</h3>
                   <span className="text-xs opacity-90 cursor-pointer hover:underline">view more &gt;</span>
                 </div>
                 
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black">NYC</span>
                    <div className="flex-1 px-4 flex items-center">
                       <div className="h-px w-full bg-white/40 relative">
                         <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 text-white">
                           <Ambulance className="h-6 w-6" />
                         </div>
                       </div>
                    </div>
                    <span className="text-2xl font-black opacity-60">PHI</span>
                 </div>
                 
                 <div className="flex justify-between text-xs font-medium opacity-90 border-t border-white/20 pt-4 mt-6">
                    <div className="flex flex-col gap-1">
                      <span>dispatch: 14:33 PM</span>
                      <span>ETA: 16:13 PM</span>
                    </div>
                    <span className="font-bold text-sm">#AMB-4523</span>
                 </div>
               </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
               <div className="flex items-center justify-between text-sm font-semibold mb-6">
                 <span className="text-black dark:text-white">60% completed</span>
                 <ChevronDown className="h-4 w-4 text-zinc-400" />
               </div>
               
               <div className="relative flex-1 opacity-90">
                 <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-zinc-100"></div>
                 
                 <div className="space-y-5 relative">
                    <div className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-zinc-200 z-10 shrink-0"></div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm text-zinc-400 font-medium whitespace-nowrap">request received</span>
                        <span className="text-xs text-zinc-400 shrink-0">10:07 AM</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-zinc-200 z-10 shrink-0"></div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm text-zinc-400 font-medium whitespace-nowrap">driver assigned</span>
                        <span className="text-xs text-zinc-400 shrink-0">13:18 PM</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-red-500 z-10 shrink-0 ring-4 ring-red-500/10"></div>
                      <div className="flex-1 flex justify-between items-center -mt-1 ml-0 bg-red-50/50 dark:bg-red-900/10 rounded-lg px-2 py-1">
                        <span className="text-sm text-black dark:text-white font-bold whitespace-nowrap">en route to patient</span>
                        <span className="text-xs text-black dark:text-white font-bold shrink-0">14:33 PM</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 opacity-50">
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-zinc-200 z-10 shrink-0"></div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">arrived at hospital</span>
                        <span className="text-xs text-zinc-500 shrink-0">Est. 16:13 PM</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Vehicle Visual Card */}
          <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 h-48 relative overflow-hidden group cursor-pointer hover:ring-zinc-200 transition-all">
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-black dark:text-white leading-tight">adv. life support<br/>ambulance</h3>
               <p className="text-xs text-zinc-500 mt-1">unit ALS-87 max</p>
               
               <div className="mt-8 flex gap-6">
                 <div>
                   <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">payload</p>
                   <p className="font-bold text-black dark:text-white text-sm">568 lbs</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">volume</p>
                   <p className="font-bold text-black dark:text-white text-sm">70 243 in³</p>
                 </div>
               </div>
             </div>
             
             {/* Decorative abstract shape representing vehicle */}
             <div className="absolute -bottom-10 -right-10 h-56 w-56 bg-zinc-50 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
               <div className="h-36 w-36 bg-zinc-100/80 dark:bg-slate-700/50 rounded-full flex items-center justify-center shadow-inner">
                  <Ambulance className="h-16 w-16 text-black dark:text-white opacity-90 drop-shadow-md transform -scale-x-100" />
               </div>
             </div>
          </div>

        </div>

        {/* Right Column (Map Overview) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-4xl shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 overflow-hidden flex flex-col relative min-h-[500px]">
          <div className="p-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md absolute top-0 left-0 right-0 z-20 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black dark:text-white">map overview</h3>
            <div className="flex gap-2">
               <button className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:text-black transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
               </button>
            </div>
          </div>
          
          {/* Google Maps View */}
          <div className="flex-1 w-full relative">
             <DashboardMap />
          </div>
          
          {/* Legend/Controls at bottom of map */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 pointer-events-auto">
               <div className="flex items-center gap-2">
                 <p className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">distance</p>
                 <p className="text-sm font-bold text-black dark:text-white">44.7 <span className="text-zinc-400 font-medium">/ 93.9 mi</span></p>
               </div>
             </div>
             <div className="flex flex-col gap-2 pointer-events-auto">
               <button className="h-10 w-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-center text-black dark:text-white font-medium hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors">
                 +
               </button>
               <button className="h-10 w-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-slate-800 flex items-center justify-center text-black dark:text-white font-medium hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors">
                 -
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
