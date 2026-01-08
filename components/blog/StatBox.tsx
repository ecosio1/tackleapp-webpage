'use client';

import { ReactNode } from 'react';

interface StatBoxProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'teal';
  size?: 'sm' | 'md' | 'lg';
}

export function StatBox({ value, label, icon, color = 'blue', size = 'md' }: StatBoxProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`rounded-xl border-2 ${colorClasses[color]} ${sizeClasses[size]} text-center`}>
      {icon && <div className="mb-2 flex justify-center">{icon}</div>}
      <div className={`font-bold ${valueSizeClasses[size]} mb-1`}>{value}</div>
      <div className="text-sm font-medium opacity-80">{label}</div>
    </div>
  );
}

interface StatGridProps {
  stats: Array<{ value: string | number; label: string; icon?: ReactNode; color?: StatBoxProps['color'] }>;
  columns?: 2 | 3 | 4;
}

export function StatGrid({ stats, columns = 3 }: StatGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 my-8`}>
      {stats.map((stat, index) => (
        <StatBox key={index} {...stat} />
      ))}
    </div>
  );
}
