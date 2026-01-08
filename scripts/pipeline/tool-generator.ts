/**
 * Interactive Tool Generator
 * Generates React components for micro-tools (calculators, comparators, etc.)
 */

import { logger } from './logger';
import { MicroTool } from './micro-tools-discovery';

export interface ToolComponent {
  tool: MicroTool;
  componentCode: string; // React component code
  serverCode?: string; // Server-side calculation logic
  schema: any; // JSON schema for the tool
}

/**
 * Generate React component for a micro-tool
 */
export function generateToolComponent(tool: MicroTool): ToolComponent {
  logger.info(`Generating component for tool: ${tool.name}`);
  
  const componentCode = generateReactComponent(tool);
  const serverCode = generateServerLogic(tool);
  const schema = generateToolSchema(tool);
  
  return {
    tool,
    componentCode,
    serverCode,
    schema,
  };
}

/**
 * Generate React component code
 */
function generateReactComponent(tool: MicroTool): string {
  const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '');
  const inputs = tool.implementation.inputs;
  const outputs = tool.implementation.outputs;
  
  return `'use client';

import { useState } from 'react';

export function ${componentName}() {
  const [inputs, setInputs] = useState({
    ${inputs.map(i => `${i.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}: ''`).join(',\n    ')}
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools/${tool.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 my-8 border-2 border-blue-200">
      <h3 className="text-2xl font-bold mb-4 text-blue-600">{'${tool.name}'}</h3>
      <p className="text-gray-600 mb-6">{'${tool.description}'}</p>
      
      <div className="space-y-4">
        ${inputs.map(input => `
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {'${input.label}'}${input.required ? ' *' : ''}
          </label>
          ${generateInputField(input)}
        </div>
        `).join('')}
        
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
        
        {results && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Results:</h4>
            ${outputs.map(output => {
              const fieldName = output.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
              return `
            <div className="mb-2">
              <span className="font-medium">{'${output.label}'}:</span>{' '}
              <span className="text-blue-600">{results.${fieldName}}</span>
            </div>
            `;
            }).join('')}
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

/**
 * Generate input field based on type
 */
function generateInputField(input: { label: string; type: string; required: boolean }): string {
  const fieldName = input.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  
  switch (input.type) {
    case 'number':
      return `<input
        type="number"
        value={inputs.${fieldName}}
        onChange={(e) => handleInputChange('${fieldName}', parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={${input.required}}
      />`;
      
    case 'select':
      return `<select
        value={inputs.${fieldName}}
        onChange={(e) => handleInputChange('${fieldName}', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={${input.required}}
      >
        <option value="">Select ${input.label}</option>
        {/* Options will be populated from data */}
      </select>`;
      
    case 'checkbox':
      return `<input
        type="checkbox"
        checked={inputs.${fieldName}}
        onChange={(e) => handleInputChange('${fieldName}', e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />`;
      
    case 'date':
      return `<input
        type="date"
        value={inputs.${fieldName}}
        onChange={(e) => handleInputChange('${fieldName}', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={${input.required}}
      />`;
      
    default:
      return `<input
        type="text"
        value={inputs.${fieldName}}
        onChange={(e) => handleInputChange('${fieldName}', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={${input.required}}
      />`;
  }
}

/**
 * Generate server-side calculation logic
 */
function generateServerLogic(tool: MicroTool): string {
  const functionName = tool.name.replace(/[^a-zA-Z0-9]/g, '');
  
  return `/**
 * ${tool.name} - Server-side calculation
 */

export async function calculate${functionName}(inputs: {
  ${tool.implementation.inputs.map(i => `${i.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}: ${getTypeScriptType(i.type)}`).join(';\n  ')}
}): Promise<{
  ${tool.implementation.outputs.map(o => `${o.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}: ${getTypeScriptType(o.type)}`).join(';\n  ')}
}> {
  // TODO: Implement calculation logic
  ${generateCalculationLogic(tool)}
  
  return {
    ${tool.implementation.outputs.map(o => `${o.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}: result${o.label.replace(/[^a-zA-Z0-9]/g, '')}`).join(',\n    ')}
  };
}
`;
}

/**
 * Generate calculation logic based on tool type
 */
function generateCalculationLogic(tool: MicroTool): string {
  switch (tool.type) {
    case 'calculator':
      return generateCalculatorLogic(tool);
    case 'comparator':
      return generateComparatorLogic(tool);
    case 'finder':
      return generateFinderLogic(tool);
    default:
      return '// Calculation logic';
  }
}

function generateCalculatorLogic(tool: MicroTool): string {
  // For cost calculators
  if (tool.name.toLowerCase().includes('cost') || tool.name.toLowerCase().includes('budget')) {
    return `
  // Cost calculation
  const licenseCost = 50; // Base license cost
  const gearCostPerDay = 25;
  const baitCostPerDay = 15;
  const boatRentalPerDay = inputs.boat_rental ? 150 : 0;
  const guideCostPerDay = inputs.guide_needed ? 400 : 0;
  
  const days = inputs.number_of_days || 1;
  const anglers = inputs.number_of_anglers || 1;
  
  const totalCost = (licenseCost * anglers) + 
                   (gearCostPerDay * days) + 
                   (baitCostPerDay * days) + 
                   (boatRentalPerDay * days) + 
                   (guideCostPerDay * days);
  
  const resultTotalCost = totalCost;
  const resultCostBreakdown = {
    licenses: licenseCost * anglers,
    gear: gearCostPerDay * days,
    bait: baitCostPerDay * days,
    boat: boatRentalPerDay * days,
    guide: guideCostPerDay * days,
  };
`;
  }
  
  return `
  // TODO: Implement ${tool.name} calculation
  const result = 0;
`;
}

function generateComparatorLogic(tool: MicroTool): string {
  return `
  // Comparison logic
  // TODO: Fetch comparison data for inputs.lure_1 and inputs.lure_2
  const comparison = {
    effectiveness: { item1: 75, item2: 80 },
    easeOfUse: { item1: 85, item2: 70 },
    versatility: { item1: 70, item2: 90 },
  };
  
  const resultComparisonTable = comparison;
  const resultRecommendation = comparison.effectiveness.item2 > comparison.effectiveness.item1 
    ? 'Item 2 is recommended' 
    : 'Item 1 is recommended';
`;
}

function generateFinderLogic(tool: MicroTool): string {
  return `
  // Finder logic
  // TODO: Query database/API for recommendations based on inputs
  const recommendations = [];
  const resultRecommendations = recommendations;
`;
}

function getTypeScriptType(type: string): string {
  switch (type) {
    case 'number':
    case 'currency':
      return 'number';
    case 'date':
    case 'time':
      return 'string';
    case 'table':
      return 'Record<string, any>';
    case 'list':
      return 'string[]';
    default:
      return 'string';
  }
}

/**
 * Generate JSON schema for tool
 */
function generateToolSchema(tool: MicroTool): any {
  return {
    name: tool.name,
    type: tool.type,
    description: tool.description,
    inputs: tool.implementation.inputs.map(input => ({
      name: input.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'),
      label: input.label,
      type: input.type,
      required: input.required,
    })),
    outputs: tool.implementation.outputs.map(output => ({
      name: output.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'),
      label: output.label,
      type: output.type,
    })),
  };
}

/**
 * Generate comparison table component
 */
export function generateComparisonTableComponent(
  item1: string,
  item2: string,
  comparisonData: Record<string, { item1: any; item2: any }>
): string {
  return `'use client';

export function ComparisonTable({ item1, item2, data }: {
  item1: string;
  item2: string;
  data: Record<string, { item1: any; item2: any }>;
}) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Feature</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{item1}</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{item2}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(data).map(([feature, values]) => (
            <tr key={feature}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{feature}</td>
              <td className="px-4 py-3 text-sm text-center">{values.item1}</td>
              <td className="px-4 py-3 text-sm text-center">{values.item2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

/**
 * Generate internal linking recommendations component
 */
export function generateAlternativeRecommendationsComponent(
  currentPage: string,
  recommendations: Array<{ title: string; slug: string; reason: string }>
): string {
  return `'use client';

export function AlternativeRecommendations({ recommendations }: {
  recommendations: Array<{ title: string; slug: string; reason: string }>;
}) {
  return (
    <div className="bg-blue-50 rounded-lg p-6 my-8 border-l-4 border-blue-600">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Alternative Recommendations</h3>
      <p className="text-gray-600 mb-4">
        If this isn't quite what you're looking for, consider these alternatives:
      </p>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2">→</span>
            <div>
              <a 
                href={rec.slug} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {rec.title}
              </a>
              <p className="text-sm text-gray-600">{rec.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
}
