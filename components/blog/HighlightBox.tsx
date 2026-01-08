'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

interface HighlightBoxProps {
  type?: 'info' | 'tip' | 'warning' | 'success' | 'note';
  title?: string;
  children: ReactNode;
}

export function HighlightBox({ type = 'info', title, children }: HighlightBoxProps) {
  const config = {
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
    tip: {
      icon: Lightbulb,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      iconColor: 'text-orange-600',
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600',
    },
    note: {
      icon: AlertCircle,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      iconColor: 'text-gray-600',
    },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[type];
  const defaultTitle = {
    info: 'Did You Know?',
    tip: 'Pro Tip',
    warning: 'Important',
    success: 'Success',
    note: 'Note',
  }[type];

  return (
    <div className={`my-6 rounded-lg border-l-4 ${bg} ${border} p-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor} mt-0.5`} />
        <div className="flex-1">
          {(title || defaultTitle) && (
            <h4 className={`mb-2 font-semibold ${text}`}>{title || defaultTitle}</h4>
          )}
          <div className={text}>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface ComparisonTableProps {
  items: Array<{ name: string; values: Record<string, string | number | boolean> }>;
  columns: Array<{ key: string; label: string }>;
}

export function ComparisonTable({ items, columns }: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-center text-sm text-gray-600">
                  {typeof item.values[col.key] === 'boolean'
                    ? item.values[col.key]
                      ? '✓'
                      : '—'
                    : item.values[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
