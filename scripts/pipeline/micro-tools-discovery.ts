/**
 * Micro-Tools Discovery
 * Uses DataForSEO and Perplexity to find interactive tool opportunities
 * Discovers calculators, comparators, and interactive elements people search for
 */

import { logger } from './logger';
import { researchTopic } from './perplexity';
import { validateKeywords, ValidationOptions } from './validation';

export interface MicroTool {
  name: string;
  type: 'calculator' | 'comparator' | 'finder' | 'estimator' | 'converter';
  description: string;
  searchQuery: string; // What people search for
  searchVolume?: number;
  keywordDifficulty?: number;
  opportunityScore: number;
  implementation: {
    inputs: Array<{ label: string; type: string; required: boolean }>;
    outputs: Array<{ label: string; type: string }>;
    formula?: string; // For calculators
    dataSource?: string; // For finders
  };
  relatedKeywords: string[];
  exampleQueries: string[];
}

export interface ToolDiscoveryOptions {
  niche: string;
  maxTools?: number;
  minVolume?: number;
  maxDifficulty?: number;
}

/**
 * Discover micro-tool opportunities using Perplexity
 */
export async function discoverMicroTools(
  options: ToolDiscoveryOptions
): Promise<MicroTool[]> {
  logger.info(`Discovering micro-tool opportunities for: ${options.niche}`);
  
  const siteSummary = `Tackle is an AI-powered fishing companion iOS app. The website provides fishing guides, species information, location guides, and fishing tips. We want to add interactive tools/calculators that anglers actually search for.`;
  
  const query = `Based on this fishing website context: "${siteSummary}"

Find ${options.maxTools || 20} interactive micro-tool opportunities that fishing enthusiasts search for. These should be:
- Calculators (cost, time, size, weight, etc.)
- Comparators (gear comparisons, species comparisons)
- Finders (best spots, best times, best gear for conditions)
- Estimators (catch potential, trip costs, tackle needs)
- Converters (units, measurements)

For each tool, provide:
1. Tool name (e.g., "Fishing Trip Cost Calculator")
2. Tool type (calculator/comparator/finder/estimator/converter)
3. Description of what it does
4. What people search for (search query)
5. Example search queries (3-5 variations)
6. What inputs the tool needs
7. What outputs it provides
8. Estimated search volume (high/medium/low)
9. Estimated difficulty to rank (easy/medium/hard)

Focus on tools that:
- Have clear search intent (people actively looking for these)
- Are practical and useful
- Don't require complex data sources
- Can be built as interactive web components

Format as a structured list.`;

  try {
    logger.info('Querying Perplexity for micro-tool opportunities...');
    const response = await researchTopic(query, {
      model: 'llama-3.1-sonar-large-128k-online',
      temperature: 0.3,
      maxTokens: 4000,
    });

    // Parse tools from response
    const tools = parseToolsFromResponse(response.answer, options.maxTools || 20);
    
    logger.info(`Discovered ${tools.length} micro-tool opportunities`);
    
    // Validate with DataForSEO if requested
    if (options.minVolume || options.maxDifficulty) {
      logger.info('Validating tools with DataForSEO...');
      const validatedTools = await validateTools(tools, {
        minVolume: options.minVolume,
        maxDifficulty: options.maxDifficulty,
      });
      return validatedTools;
    }
    
    return tools;

  } catch (error) {
    logger.error('Error discovering micro-tools:', error);
    throw error;
  }
}

/**
 * Parse tools from Perplexity response
 */
function parseToolsFromResponse(response: string, maxTools: number): MicroTool[] {
  const tools: MicroTool[] = [];
  
  // Try numbered list
  const numberedPattern = /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs;
  const matches = Array.from(response.matchAll(numberedPattern));
  
  for (const match of matches.slice(0, maxTools)) {
    const content = match[2].trim();
    const tool = parseToolFromText(content);
    if (tool) {
      tools.push(tool);
    }
  }
  
  // If no numbered list, try bullet points
  if (tools.length === 0) {
    const bulletPattern = /[-•*]\s*(.+?)(?=[-•*]|$)/gs;
    const bulletMatches = Array.from(response.matchAll(bulletPattern));
    
    for (const match of bulletMatches.slice(0, maxTools)) {
      const content = match[1].trim();
      const tool = parseToolFromText(content);
      if (tool) {
        tools.push(tool);
      }
    }
  }
  
  return tools.slice(0, maxTools);
}

/**
 * Parse a single tool from text
 */
function parseToolFromText(text: string): MicroTool | null {
  // Extract tool name
  const nameMatch = text.match(/(?:Tool|Name)[:：]\s*(.+?)(?:\n|$)/i) ||
                   text.match(/^(.+?)(?:\s*[-–]|$)/);
  if (!nameMatch) return null;
  
  const name = nameMatch[1].trim();
  
  // Extract type
  const typeMatch = text.match(/(?:Type|Category)[:：]\s*(calculator|comparator|finder|estimator|converter)/i);
  const type = (typeMatch ? typeMatch[1].toLowerCase() : 'calculator') as MicroTool['type'];
  
  // Extract description
  const descMatch = text.match(/(?:Description|What)[:：]\s*(.+?)(?:\n|$)/i);
  const description = descMatch ? descMatch[1].trim() : name;
  
  // Extract search query
  const queryMatch = text.match(/(?:Search|Query)[:：]\s*(.+?)(?:\n|$)/i);
  const searchQuery = queryMatch ? queryMatch[1].trim() : name.toLowerCase();
  
  // Extract example queries
  const exampleQueries: string[] = [];
  const exampleMatch = text.match(/(?:Examples?|Queries?)[:：]\s*(.+?)(?:\n|$)/i);
  if (exampleMatch) {
    const examples = exampleMatch[1].split(/[,;]/).map(e => e.trim());
    exampleQueries.push(...examples.slice(0, 5));
  }
  
  // Extract inputs/outputs
  const inputs: MicroTool['implementation']['inputs'] = [];
  const outputs: MicroTool['implementation']['outputs'] = [];
  
  const inputsMatch = text.match(/(?:Inputs?|Needs?)[:：]\s*(.+?)(?:\n|$)/i);
  if (inputsMatch) {
    const inputList = inputsMatch[1].split(/[,;]/).map(i => i.trim());
    inputList.forEach(input => {
      if (input.length > 2) {
        inputs.push({
          label: input,
          type: inferInputType(input),
          required: true,
        });
      }
    });
  }
  
  const outputsMatch = text.match(/(?:Outputs?|Results?)[:：]\s*(.+?)(?:\n|$)/i);
  if (outputsMatch) {
    const outputList = outputsMatch[1].split(/[,;]/).map(o => o.trim());
    outputList.forEach(output => {
      if (output.length > 2) {
        outputs.push({
          label: output,
          type: inferOutputType(output),
        });
      }
    });
  }
  
  // Extract volume/difficulty estimates
  const volumeMatch = text.match(/(?:Volume|Search Volume)[:：]\s*(high|medium|low)/i);
  const difficultyMatch = text.match(/(?:Difficulty|Rank Difficulty)[:：]\s*(easy|medium|hard)/i);
  
  // Calculate opportunity score
  const opportunityScore = calculateToolOpportunityScore(
    volumeMatch ? volumeMatch[1].toLowerCase() : 'medium',
    difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium'
  );
  
  // Generate related keywords
  const relatedKeywords = generateRelatedKeywords(name, type, searchQuery);
  
  return {
    name,
    type,
    description,
    searchQuery,
    opportunityScore,
    implementation: {
      inputs: inputs.length > 0 ? inputs : generateDefaultInputs(type),
      outputs: outputs.length > 0 ? outputs : generateDefaultOutputs(type),
    },
    relatedKeywords,
    exampleQueries: exampleQueries.length > 0 ? exampleQueries : [searchQuery],
  };
}

/**
 * Validate tools with DataForSEO
 */
async function validateTools(
  tools: MicroTool[],
  options: ValidationOptions
): Promise<MicroTool[]> {
  logger.info(`Validating ${tools.length} tools with DataForSEO...`);
  
  // Extract search queries
  const queries = tools.map(t => t.searchQuery);
  
  // Validate keywords
  const validated = await validateKeywords(queries, {
    minVolume: options.minVolume || 50, // Lower threshold for tools
    maxVolume: options.maxVolume || 1000,
    intent: 'informational',
    includeQuestions: false,
  });
  
  // Create map of validated keywords
  const validatedMap = new Map(
    validated.map(k => [k.keyword.toLowerCase(), k])
  );
  
  // Update tools with validation data
  const validatedTools = tools.map(tool => {
    const validated = validatedMap.get(tool.searchQuery.toLowerCase());
    
    if (validated) {
      return {
        ...tool,
        searchVolume: validated.searchVolume,
        keywordDifficulty: validated.keywordDifficulty,
        opportunityScore: validated.opportunityScore,
      };
    }
    
    return tool;
  });
  
  // Sort by opportunity score
  validatedTools.sort((a, b) => b.opportunityScore - a.opportunityScore);
  
  const validCount = validatedTools.filter(t => t.searchVolume && t.searchVolume > 0).length;
  logger.info(`Validated ${validCount}/${tools.length} tools with search volume data`);
  
  return validatedTools;
}

// Helper functions
function inferInputType(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('cost') || lower.includes('price') || lower.includes('budget')) return 'number';
  if (lower.includes('date') || lower.includes('time') || lower.includes('day')) return 'date';
  if (lower.includes('location') || lower.includes('place') || lower.includes('spot')) return 'text';
  if (lower.includes('species') || lower.includes('fish')) return 'select';
  if (lower.includes('length') || lower.includes('weight') || lower.includes('size')) return 'number';
  return 'text';
}

function inferOutputType(output: string): string {
  const lower = output.toLowerCase();
  if (lower.includes('cost') || lower.includes('price') || lower.includes('total')) return 'currency';
  if (lower.includes('time') || lower.includes('duration')) return 'time';
  if (lower.includes('recommendation') || lower.includes('suggestion')) return 'text';
  if (lower.includes('comparison') || lower.includes('vs')) return 'table';
  return 'text';
}

function generateDefaultInputs(type: MicroTool['type']): MicroTool['implementation']['inputs'] {
  switch (type) {
    case 'calculator':
      return [
        { label: 'Number of days', type: 'number', required: true },
        { label: 'Number of anglers', type: 'number', required: true },
      ];
    case 'comparator':
      return [
        { label: 'Item 1', type: 'text', required: true },
        { label: 'Item 2', type: 'text', required: true },
      ];
    case 'finder':
      return [
        { label: 'Location', type: 'text', required: true },
        { label: 'Species', type: 'select', required: false },
      ];
    default:
      return [{ label: 'Input', type: 'text', required: true }];
  }
}

function generateDefaultOutputs(type: MicroTool['type']): MicroTool['implementation']['outputs'] {
  switch (type) {
    case 'calculator':
      return [{ label: 'Total Cost', type: 'currency' }];
    case 'comparator':
      return [{ label: 'Comparison', type: 'table' }];
    case 'finder':
      return [{ label: 'Recommendations', type: 'text' }];
    default:
      return [{ label: 'Result', type: 'text' }];
  }
}

function generateRelatedKeywords(name: string, type: string, searchQuery: string): string[] {
  const keywords: string[] = [searchQuery];
  
  // Add variations
  keywords.push(`${name} online`);
  keywords.push(`free ${name.toLowerCase()}`);
  keywords.push(`${name.toLowerCase()} tool`);
  
  if (type === 'calculator') {
    keywords.push(`${name.toLowerCase()} free`);
  }
  
  return keywords.slice(0, 5);
}

function calculateToolOpportunityScore(volume: string, difficulty: string): number {
  let score = 0;
  
  // Volume score
  if (volume === 'high') score += 40;
  else if (volume === 'medium') score += 25;
  else score += 10;
  
  // Difficulty score (lower is better)
  if (difficulty === 'easy') score += 40;
  else if (difficulty === 'medium') score += 25;
  else score += 10;
  
  // Tool bonus (tools often have lower competition)
  score += 20;
  
  return Math.min(score, 100);
}

/**
 * Get recommended fishing micro-tools (pre-researched)
 */
export function getRecommendedFishingTools(): MicroTool[] {
  return [
    {
      name: 'Fishing Trip Cost Calculator',
      type: 'calculator',
      description: 'Calculate total cost of a fishing trip including licenses, gear, bait, and boat rental',
      searchQuery: 'fishing trip cost calculator',
      opportunityScore: 85,
      implementation: {
        inputs: [
          { label: 'Number of days', type: 'number', required: true },
          { label: 'Number of anglers', type: 'number', required: true },
          { label: 'State', type: 'select', required: true },
          { label: 'Boat rental needed?', type: 'checkbox', required: false },
          { label: 'Guide needed?', type: 'checkbox', required: false },
        ],
        outputs: [
          { label: 'Total Estimated Cost', type: 'currency' },
          { label: 'Cost Breakdown', type: 'table' },
        ],
      },
      relatedKeywords: ['fishing trip cost', 'fishing budget calculator', 'how much does fishing cost'],
      exampleQueries: [
        'fishing trip cost calculator',
        'how much does a fishing trip cost',
        'fishing trip budget calculator',
      ],
    },
    {
      name: 'Tackle Budget Calculator',
      type: 'calculator',
      description: 'Calculate how much to budget for fishing tackle and gear',
      searchQuery: 'tackle budget calculator',
      opportunityScore: 80,
      implementation: {
        inputs: [
          { label: 'Experience level', type: 'select', required: true },
          { label: 'Target species', type: 'select', required: true },
          { label: 'Fishing type', type: 'select', required: true },
        ],
        outputs: [
          { label: 'Recommended Budget', type: 'currency' },
          { label: 'Essential Items', type: 'list' },
        ],
      },
      relatedKeywords: ['fishing tackle budget', 'how much to spend on fishing gear', 'fishing gear cost'],
      exampleQueries: [
        'tackle budget calculator',
        'how much should I spend on fishing gear',
        'fishing tackle cost calculator',
      ],
    },
    {
      name: 'Best Fishing Time Finder',
      type: 'finder',
      description: 'Find the best time to fish based on location, species, and conditions',
      searchQuery: 'best time to fish calculator',
      opportunityScore: 90,
      implementation: {
        inputs: [
          { label: 'Location', type: 'text', required: true },
          { label: 'Species', type: 'select', required: false },
          { label: 'Date', type: 'date', required: true },
        ],
        outputs: [
          { label: 'Best Times', type: 'time' },
          { label: 'Tide Information', type: 'text' },
          { label: 'Weather Conditions', type: 'text' },
        ],
        dataSource: 'NOAA tides, weather API',
      },
      relatedKeywords: ['best time to fish', 'fishing time calculator', 'when to fish'],
      exampleQueries: [
        'best time to fish calculator',
        'when is the best time to fish today',
        'fishing time finder',
      ],
    },
    {
      name: 'Lure Comparison Tool',
      type: 'comparator',
      description: 'Compare different lures side-by-side for specific species and conditions',
      searchQuery: 'lure comparison tool',
      opportunityScore: 75,
      implementation: {
        inputs: [
          { label: 'Lure 1', type: 'select', required: true },
          { label: 'Lure 2', type: 'select', required: true },
          { label: 'Target species', type: 'select', required: true },
          { label: 'Water conditions', type: 'select', required: false },
        ],
        outputs: [
          { label: 'Comparison Table', type: 'table' },
          { label: 'Recommendation', type: 'text' },
        ],
      },
      relatedKeywords: ['lure comparison', 'best lure for', 'lure vs lure'],
      exampleQueries: [
        'lure comparison tool',
        'topwater vs soft plastic',
        'best lure comparison',
      ],
    },
    {
      name: 'Fish Size Limit Checker',
      type: 'finder',
      description: 'Check size and bag limits for fish species by state',
      searchQuery: 'fish size limit checker',
      opportunityScore: 88,
      implementation: {
        inputs: [
          { label: 'State', type: 'select', required: true },
          { label: 'Species', type: 'select', required: true },
        ],
        outputs: [
          { label: 'Size Limit', type: 'text' },
          { label: 'Bag Limit', type: 'text' },
          { label: 'Season', type: 'text' },
        ],
        dataSource: 'State regulations database',
      },
      relatedKeywords: ['fish size limit', 'fishing regulations checker', 'bag limit calculator'],
      exampleQueries: [
        'fish size limit checker',
        'redfish size limit florida',
        'fishing regulations checker',
      ],
    },
    {
      name: 'Tide Fishing Window Calculator',
      type: 'calculator',
      description: 'Calculate optimal fishing windows based on tide times',
      searchQuery: 'tide fishing window calculator',
      opportunityScore: 82,
      implementation: {
        inputs: [
          { label: 'Location', type: 'text', required: true },
          { label: 'Date', type: 'date', required: true },
          { label: 'Target species', type: 'select', required: false },
        ],
        outputs: [
          { label: 'Optimal Windows', type: 'time' },
          { label: 'Tide Chart', type: 'chart' },
        ],
        dataSource: 'NOAA tides',
      },
      relatedKeywords: ['tide fishing calculator', 'best tide to fish', 'fishing tide window'],
      exampleQueries: [
        'tide fishing window calculator',
        'best tide for fishing',
        'fishing tide calculator',
      ],
    },
  ];
}
