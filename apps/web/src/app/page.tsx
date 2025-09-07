import KPICard from '@/components/dashboard/KPICard'
import FundingChart from '@/components/dashboard/FundingChart'
import PipelineChart from '@/components/dashboard/PipelineChart'
import RiskTrendChart from '@/components/dashboard/RiskTrendChart'
import TopBrokers from '@/components/dashboard/TopBrokers'
import AIChatAssistant from '@/components/ai/AIChatAssistant'
import AIInsightsCard from '@/components/ai/AIInsightsCard'
import AIDealScoring from '@/components/ai/AIDealScoring'
import ActivityFeed from '@/components/dashboard/ActivityFeed'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-text-primary">Dashboard</h1>
        <select className="px-3 py-2 text-sm bg-surface border border-gray-200 rounded-lg text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
          <option>Last 30 days</option>
          <option>Last 60 days</option>
          <option>Last 90 days</option>
          <option>Year to date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Funded (YTD)" 
          value="$12.4M" 
          change={24} 
          sparklineData={[40, 45, 42, 50, 55, 60, 58, 65, 70, 75]}
        />
        <KPICard 
          title="Advances Outstanding" 
          value="$8.7M" 
          change={12} 
          sparklineData={[60, 58, 62, 65, 63, 68, 70, 72, 75, 78]}
        />
        <KPICard 
          title="Avg Factor Rate" 
          value="1.32" 
          change={-2} 
          changeLabel="from last quarter"
          sparklineData={[50, 52, 51, 49, 48, 47, 46, 45, 44, 43]}
        />
        <KPICard 
          title="Default %" 
          value="2.8%" 
          change={-15} 
          changeLabel="improvement"
          sparklineData={[40, 38, 36, 35, 33, 32, 30, 28, 26, 24]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FundingChart />
        <PipelineChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskTrendChart />
        <TopBrokers />
        <ActivityFeed />
      </div>

      {/* AI Intelligence Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AIChatAssistant />
        <AIInsightsCard />
        <AIDealScoring />
      </div>
    </div>
  )
}