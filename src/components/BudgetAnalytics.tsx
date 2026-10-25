import React from 'react';
import { Trip } from '../types/travel';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';

interface BudgetAnalyticsProps {
  trip: Trip;
}

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#8b5cf6', '#64748b'];

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({ trip }) => {
  const { budgetBreakdown, totalEstimatedCost, budget, currency, days } = trip;

  const categoryData = [
    { name: 'Accommodation', amount: budgetBreakdown.accommodation, color: '#0d9488' },
    { name: 'Food & Dining', amount: budgetBreakdown.food, color: '#0284c7' },
    { name: 'Activities', amount: budgetBreakdown.activities, color: '#f59e0b' },
    { name: 'Transit', amount: budgetBreakdown.transportation, color: '#8b5cf6' },
    { name: 'Miscellaneous', amount: budgetBreakdown.miscellaneous, color: '#64748b' }
  ];

  const dailyData = days.map(d => ({
    day: `Day ${d.dayNumber}`,
    cost: d.estimatedDayCost,
    theme: d.theme
  }));

  const budgetVariance = budget - totalEstimatedCost;
  const isWithinBudget = budgetVariance >= 0;
  const percentageUsed = Math.round((totalEstimatedCost / (budget || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Target Budget</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {currency} {budget.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Configured for {trip.travelerCount} traveler(s)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Estimated Trip Cost</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700">
            {currency} {totalEstimatedCost.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Includes stay, meals & activities</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Budget Status</span>
            {isWithinBudget ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className={`text-xl font-bold ${isWithinBudget ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isWithinBudget ? `+${currency} ${budgetVariance.toLocaleString()}` : `-${currency} ${Math.abs(budgetVariance).toLocaleString()}`}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isWithinBudget ? 'Buffer remaining for souvenirs' : 'Exceeds target by ' + Math.abs(budgetVariance)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Avg Cost Per Day</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {currency} {Math.round(totalEstimatedCost / (days.length || 1)).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {days.length} day(s)</p>
        </div>
      </div>

      {/* Progress Bar against Target Budget */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-slate-800">Budget Utilization</span>
          <span className="font-medium text-slate-600">{percentageUsed}% of planned cap</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageUsed > 100 ? 'bg-amber-500' : 'bg-teal-600'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
        {!isWithinBudget && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold">Budget Optimization Warning:</span> Your estimated itinerary expenses exceed your specified budget cap. Consider switching to boutique or mid-range accommodation, or choosing free walking stops.
            </div>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Allocation Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Estimated Spending by Category</h4>
          <p className="text-xs text-slate-500 mb-4">Breakdown of primary cost centers ({currency})</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={95} />
                <Tooltip
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, 'Estimated Cost']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Variance Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Daily Itinerary Cost Comparison</h4>
          <p className="text-xs text-slate-500 mb-4">Activities & meal estimations per day</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, 'Day Expenses']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="cost" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Indicative Pricing Note:</strong> All estimated prices are calculated from current seasonal averages, standard admissions, and median meal prices for {trip.destination}. Actual rates may fluctuate based on peak holiday dates, currency exchange, and advance booking timing.
        </p>
      </div>
    </div>
  );
};
