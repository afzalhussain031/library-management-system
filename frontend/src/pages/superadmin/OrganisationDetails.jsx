import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Search, GraduationCap, Users, BookOpen, 
  BookMarked, ChevronDown, CheckCircle2, AlertTriangle, 
  Clock, DollarSign, Calendar, ShieldCheck, Mail, FileText,
  UserCheck, AlertCircle, Ban, Send, Award, Bell
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const CHART_DATA = [
  { day: '01 May', students: 3800, active: 1100, books: 17500, borrowed: 2100 },
  { day: '05 May', students: 3950, active: 1150, books: 17700, borrowed: 2200 },
  { day: '10 May', students: 4100, active: 1200, books: 17950, borrowed: 2150 },
  { day: '15 May', students: 4350, active: 1280, books: 18100, borrowed: 2250 },
  { day: '20 May', students: 4500, active: 1230, books: 18300, borrowed: 2300 },
  { day: '25 May', students: 4680, active: 1245, books: 18490, borrowed: 2280 },
  { day: '30 May', students: 4782, active: 1256, books: 18650, borrowed: 2341 }
];

const ADMIN_TEAM = [
  { name: 'Priya Sharma', role: 'Library Admin', active: 'Today, 10:23 AM', status: 'Online', initials: 'PS', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Rahul Verma', role: 'Assistant Admin', active: 'Today, 09:15 AM', status: 'Online', initials: 'RV', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Amit Kumar', role: 'Librarian', active: 'Yesterday, 06:45 PM', status: 'Offline', initials: 'AK', color: 'bg-amber-100 text-amber-700' },
  { name: 'Sneha Patel', role: 'Librarian', active: '2 Days Ago', status: 'Offline', initials: 'SP', color: 'bg-rose-100 text-rose-700' }
];

const RECENT_ACTIVITIES = [
  { id: 1, title: 'New book "Operating System Concepts" added', details: 'by Priya Sharma', time: 'Today, 10:15 AM', type: 'book' },
  { id: 2, title: '42 books issued to 18 students', details: 'by Rahul Verma', time: 'Today, 09:40 AM', type: 'issue' },
  { id: 3, title: 'Payment of ₹62,250 received', details: 'Transaction ID: TNX3456789', time: 'Yesterday, 04:22 PM', type: 'payment' }
];

const RISK_ALERTS = [
  { id: 1, title: 'Overdue rate is high (14.6%)', details: 'Compare to system average (8.2%)' },
  { id: 2, title: '32 books are overdue for more than 15 days', details: 'Consider sending reminders to users' },
  { id: 3, title: 'Admin Amit Kumar has been inactive for 5 days', details: 'Consider checking or assigning backup' },
  { id: 4, title: 'Plan expires in 203 days', details: 'Ensure timely renewal to avoid interruption' }
];

const OrganisationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeRange, setActiveRange] = useState('Last 30 Days');
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  return (
    <div className="px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen bg-transparent">
      
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/super/organisations')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-[#1C2434] shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft size={14} className="text-[#DEB853]" /> Back to Libraries
        </button>

        {/* Dynamic global search bar */}
        <div className="relative w-full sm:w-80 md:w-96">
          <input 
            type="text" 
            placeholder="Search for users, books, requests..." 
            className="w-full bg-white border border-slate-200 rounded-full py-2 pl-4 pr-16 text-xs font-semibold outline-none focus:border-[#F6BE0A] shadow-sm"
          />
          <div className="absolute right-3.5 top-2 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-extrabold text-[#A0ABC0] select-none pointer-events-none">
            Ctrl + K
          </div>
        </div>
      </div>

      {/* Main library details banner */}
      <div 
        className="w-full bg-white rounded-[32px] border border-white/60 p-6 md:p-8 flex flex-col xl:flex-row justify-between gap-6 md:gap-8 shadow-sm"
        style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
      >
        {/* Banner Left Details */}
        <div className="flex flex-col lg:flex-row gap-6 items-start flex-1">
          {/* Logo container */}
          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm relative group">
            <img 
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=300"
              alt="Library image" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Logo</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#1C2434] tracking-tight">Main Campus Library</h1>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider shadow-sm">
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-[#A0ABC0]">Delhi University • New Delhi, India</p>
            </div>

            {/* Info details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Library Code</p>
                <p className="text-sm font-extrabold text-[#1C2434] mt-0.5">DU-MAIN-001</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Established On</p>
                <p className="text-sm font-extrabold text-[#1C2434] mt-0.5">12 Jan 2018</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Branch Type</p>
                <p className="text-sm font-extrabold text-[#1C2434] mt-0.5">Main Branch</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Total Staff</p>
                <p className="text-sm font-extrabold text-[#1C2434] mt-0.5">18 Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Right Plan Subcard & Actions */}
        <div className="flex flex-col justify-between items-end gap-6 min-w-[280px]">
          {/* Top buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white font-extrabold text-xs rounded-full shadow-sm active:scale-95 transition-all">
              <ShieldCheck size={14} /> Open as Admin
            </button>
            <button className="px-5 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold text-xs rounded-full shadow-sm active:scale-95 transition-all">
              Suspend Branch
            </button>
          </div>

          {/* Plan Subcard */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 flex justify-between gap-4 shadow-inner">
            <div>
              <p className="text-[9px] font-bold text-[#A0ABC0] uppercase tracking-wider">Plan</p>
              <p className="text-sm font-black text-[#1C2434] mt-0.5">Premium</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#A0ABC0] uppercase tracking-wider">Renewal Date</p>
              <p className="text-xs font-extrabold text-[#1C2434] mt-0.5">12 Dec 2026</p>
              <p className="text-[9px] font-bold text-emerald-600 mt-0.5">(In 203 days)</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#A0ABC0] uppercase tracking-wider">Subscription Status</p>
              <p className="text-xs font-black text-emerald-600 mt-0.5">Paid</p>
            </div>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-3 justify-end w-full">
            <button className="flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[#1C2434] transition-colors bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
              <FileText size={12} /> Export Report
            </button>
            <button className="flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[#1C2434] transition-colors bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
              <Mail size={12} /> Contact Admin
            </button>
          </div>
        </div>
      </div>

      {/* Analytics stat cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div 
          className="bg-white rounded-[24px] border border-white p-5 flex items-center gap-4 shadow-sm"
          style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A0ABC0]">Students Registered</p>
            <h2 className="text-2xl font-black text-[#1C2434] mt-0.5">4,782</h2>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 12.4% vs last month</p>
          </div>
        </div>

        {/* Card 2 */}
        <div 
          className="bg-white rounded-[24px] border border-white p-5 flex items-center gap-4 shadow-sm"
          style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A0ABC0]">Active Users (This Month)</p>
            <h2 className="text-2xl font-black text-[#1C2434] mt-0.5">1,256</h2>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 18.7% vs last month</p>
          </div>
        </div>

        {/* Card 3 */}
        <div 
          className="bg-white rounded-[24px] border border-white p-5 flex items-center gap-4 shadow-sm"
          style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A0ABC0]">Total Books</p>
            <h2 className="text-2xl font-black text-[#1C2434] mt-0.5">18,650</h2>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 8.3% vs last month</p>
          </div>
        </div>

        {/* Card 4 */}
        <div 
          className="bg-white rounded-[24px] border border-white p-5 flex items-center gap-4 shadow-sm"
          style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <BookMarked size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A0ABC0]">Currently Borrowed</p>
            <h2 className="text-2xl font-black text-[#1C2434] mt-0.5">2,341</h2>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 5.6% vs last month</p>
          </div>
        </div>
      </div>

      {/* Large multiline LineChart */}
      <div 
        className="w-full bg-white rounded-[32px] border border-white/60 p-6 md:p-8 shadow-sm flex flex-col gap-6"
        style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
      >
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-[#1C2434]">Usage Overview (Last 30 Days)</h2>
          
          <div className="relative">
            <button 
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all"
            >
              {activeRange} <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isRangeOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-30 animate-fade-in">
                {['Last 7 Days', 'Last 30 Days', 'Last 6 Months'].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRange(r);
                      setIsRangeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                      activeRange === r ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recharts Component */}
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0px 10px 30px rgba(0,0,0,0.03)' }}
                labelStyle={{ fontWeight: 800, fontSize: 11, color: '#1C2434' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              <Line type="monotone" name="Students Registered" dataKey="students" stroke="#4F46E5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Active Users" dataKey="active" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Total Books" dataKey="books" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Currently Borrowed" dataKey="borrowed" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Widget Console */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column (Requests, Recent Activity, Financial) */}
        <div className="space-y-6">
          
          {/* Widget 1: Requests Performance */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Requests Performance <span className="text-[10px] font-bold text-[#A0ABC0] ml-1">(This Month)</span></h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Details</button>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-100 pb-6">
              <div className="text-center">
                <p className="text-[9px] font-extrabold text-[#A0ABC0] uppercase tracking-wider">Total Requests</p>
                <p className="text-2xl font-black text-[#1C2434] mt-1">428</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-extrabold text-[#A0ABC0] uppercase tracking-wider text-emerald-600">Approved</p>
                <p className="text-lg font-black text-emerald-600 mt-1">256</p>
                <p className="text-[9px] font-bold text-emerald-600 mt-0.5">59.8%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-extrabold text-[#A0ABC0] uppercase tracking-wider text-rose-600">Rejected</p>
                <p className="text-lg font-black text-rose-600 mt-1">42</p>
                <p className="text-[9px] font-bold text-rose-600 mt-0.5">9.8%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-extrabold text-[#A0ABC0] uppercase tracking-wider text-amber-600">Pending</p>
                <p className="text-lg font-black text-amber-600 mt-1">130</p>
                <p className="text-[9px] font-bold text-amber-600 mt-0.5">30.4%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#A0ABC0] uppercase tracking-wider">Average Approval Time</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <p className="text-sm font-extrabold text-[#1C2434]">2h 34m</p>
                      <span className="text-[9px] font-bold text-emerald-600">↓ 18% vs last month</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#A0ABC0] uppercase tracking-wider">Requests Completion Rate</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <p className="text-sm font-extrabold text-[#1C2434]">89.6%</p>
                      <span className="text-[9px] font-bold text-emerald-600">↑ 7.2% vs last month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Ring Graphic matching screenshot */}
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="34" stroke="#4F46E5" strokeWidth="6" fill="transparent" strokeDasharray="213.6" strokeDashoffset="21.36" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-[#1C2434]">90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Recent Activity */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-5 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Recent Activity</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>

            <div className="space-y-4">
              {RECENT_ACTIVITIES.map(act => (
                <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-b-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    act.type === 'book' ? 'bg-indigo-50 text-indigo-600' : act.type === 'issue' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {act.type === 'book' ? <BookOpen size={14} /> : act.type === 'issue' ? <Users size={14} /> : <DollarSign size={14} />}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-[#1C2434] leading-tight">{act.title}</p>
                    <p className="text-[10px] font-semibold text-[#A0ABC0]">{act.details} • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Financial Overview */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Financial Overview</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Payment History</button>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[#64748B] border-b border-slate-50 pb-2.5">
                <span>Current Plan</span>
                <span className="font-extrabold text-[#1C2434]">Premium</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#64748B] border-b border-slate-50 pb-2.5">
                <span>Last Payment</span>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600">₹62,250</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">Paid</span>
                  <p className="text-[9px] text-[#A0ABC0] mt-0.5">12 Dec 2023</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#64748B] border-b border-slate-50 pb-2.5">
                <span>Next Renewal</span>
                <div className="text-right">
                  <span className="font-extrabold text-[#1C2434]">₹62,250</span>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5">12 Dec 2026 (In 203 days)</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#64748B]">
                <span>Outstanding Balance</span>
                <div className="text-right">
                  <span className="font-extrabold text-[#1C2434]">₹0</span>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5">No due amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Admin Team, Risk Alerts, Quick Actions) */}
        <div className="space-y-6">
          
          {/* Widget 1: Admin Team */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Admin Team</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>

            <div className="space-y-4">
              {ADMIN_TEAM.map((admin, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-xs ${admin.color} shadow-sm`}>
                      {admin.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1C2434] leading-tight">{admin.name}</h4>
                      <p className="text-[10px] font-semibold text-[#A0ABC0]">{admin.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      admin.status === 'Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${admin.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {admin.status}
                    </span>
                    <p className="text-[9px] text-[#A0ABC0] font-semibold mt-0.5">{admin.active}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-extrabold text-indigo-600 border-t border-slate-100 pt-4 mt-2">
              <span className="text-[#A0ABC0] uppercase font-bold text-[9px] tracking-wider mr-1">Actions:</span>
              <button className="hover:text-indigo-800 transition-colors">Message</button>
              <span className="text-slate-300">•</span>
              <button className="hover:text-indigo-800 transition-colors">Impersonate Login</button>
              <span className="text-slate-300">•</span>
              <button className="text-rose-500 hover:text-rose-700 transition-colors">Disable Account</button>
            </div>
          </div>

          {/* Widget 2: Risk Alerts */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-5 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Risk Alerts</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All Alerts</button>
            </div>

            <div className="space-y-4">
              {RISK_ALERTS.map(alert => (
                <div key={alert.id} className="flex justify-between items-start gap-4 pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-rose-50 rounded-xl text-rose-600 mt-0.5 flex-shrink-0">
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2434] leading-snug">{alert.title}</h4>
                      <p className="text-[10px] font-semibold text-[#A0ABC0] mt-0.5">{alert.details}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex-shrink-0 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full shadow-sm hover:bg-slate-100 transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Quick Actions */}
          <div 
            className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-5 shadow-sm"
            style={{ boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#1C2434]">Quick Actions</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Manage</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold border border-slate-100 shadow-sm active:scale-95 transition-all">
                <Send size={14} className="text-indigo-600" /> Send Announcement
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold border border-slate-100 shadow-sm active:scale-95 transition-all">
                <FileText size={14} className="text-emerald-600" /> View Branch Reports
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold border border-slate-100 shadow-sm active:scale-95 transition-all">
                <Mail size={14} className="text-amber-600" /> Contact Branch Admin
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold border border-slate-100 shadow-sm active:scale-95 transition-all">
                <Calendar size={14} className="text-rose-600" /> Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDetails;
