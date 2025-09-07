import React from 'react'
import { TrendingUp } from 'lucide-react'

const brokers = [
  { name: 'Capital Connect Partners', deals: 42, funded: '$4.2M', conversion: 78 },
  { name: 'Velocity Funding Solutions', deals: 38, funded: '$3.8M', conversion: 72 },
  { name: 'Prime Business Capital', deals: 35, funded: '$3.5M', conversion: 65 },
  { name: 'Merchant Growth Partners', deals: 31, funded: '$3.1M', conversion: 61 },
  { name: 'Advance Funding Network', deals: 28, funded: '$2.8M', conversion: 58 },
]

export default function TopBrokers() {
  return (
    <div className="bg-surface rounded-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-text-primary">Top Brokers</h3>
        <span className="text-small text-text-muted">This Month</span>
      </div>
      
      <div className="space-y-3">
        {brokers.map((broker, index) => (
          <div key={broker.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-h3 font-bold text-text-muted w-5">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {broker.name}
                </p>
                <p className="text-small text-text-muted">
                  {broker.deals} deals • {broker.funded}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">{broker.conversion}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}