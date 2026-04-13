import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { time: '9:00', value: [70, 90] },
  { time: '10:00', value: [80, 100] },
  { time: '11:00', value: [75, 110] },
  { time: '12:00', value: [85, 115] },
  { time: '13:00', value: [80, 105] },
  { time: '14:00', value: [70, 95] },
  { time: '15:00', value: [75, 100] },
];

// Custom bar to show range
const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      rx={width / 2} 
      fill={fill} 
    />
  );
};

export function HeartRateChart() {
  return (
    <div className="bg-white p-8 rounded-[40px] soft-shadow">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-display font-bold text-gray-900">Heart Rate</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-bold text-gray-900">92</span>
            <span className="text-sm font-medium text-gray-400">avg bpm</span>
          </div>
        </div>
        <button className="text-brand-primary text-sm font-bold flex items-center gap-1 hover:underline">
          View All Trends <span className="text-lg">›</span>
        </button>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              domain={[60, 120]}
              ticks={[60, 80, 100, 120]}
            />
            <Bar 
              dataKey="value" 
              shape={<CustomBar />} 
              barSize={8}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 3 ? '#00D1FF' : '#A5F3FC'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
