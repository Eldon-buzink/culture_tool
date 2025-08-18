'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface TermExplanationProps {
  term: string;
  definition: string;
  examples?: string[];
  category: 'ocean' | 'culture' | 'values';
}

const termDefinitions = {
  ocean: {
    openness: {
      definition: "Openness to Experience reflects your curiosity, creativity, and willingness to try new things.",
      examples: ["Enjoys abstract thinking", "Appreciates art and beauty", "Seeks out new experiences", "Values variety over routine"]
    },
    conscientiousness: {
      definition: "Conscientiousness measures your self-discipline, organization, and goal-directed behavior.",
      examples: ["Plans ahead and follows through", "Pays attention to details", "Prefers order and structure", "Reliable and dependable"]
    },
    extraversion: {
      definition: "Extraversion indicates your energy level, social engagement, and preference for external stimulation.",
      examples: ["Energized by social interactions", "Enjoys being the center of attention", "Prefers group activities", "Expressive and talkative"]
    },
    agreeableness: {
      definition: "Agreeableness reflects your tendency to be cooperative, trusting, and considerate of others.",
      examples: ["Trusts others easily", "Cooperative in team settings", "Avoids conflicts", "Helpful and compassionate"]
    },
    neuroticism: {
      definition: "Neuroticism measures your emotional stability and tendency to experience negative emotions.",
      examples: ["Experiences stress easily", "Worries about things", "Gets upset by minor issues", "Mood changes frequently"]
    }
  },
  culture: {
    power_distance: {
      definition: "Power Distance reflects your comfort with hierarchy and authority in the workplace.",
      examples: ["High: Prefers clear hierarchies and respects authority", "Low: Prefers flat structures and equal participation"]
    },
    individualism: {
      definition: "Individualism vs. Collectivism shows your preference for individual achievement versus group success.",
      examples: ["High: Values personal goals and independence", "Low: Values team success and group harmony"]
    },
    masculinity: {
      definition: "Masculinity vs. Femininity indicates competitive versus collaborative work preferences.",
      examples: ["High: Values competition and achievement", "Low: Values cooperation and quality of life"]
    },
    uncertainty_avoidance: {
      definition: "Uncertainty Avoidance measures your comfort with ambiguity and change.",
      examples: ["High: Prefers clear rules and procedures", "Low: Comfortable with flexibility and change"]
    },
    long_term_orientation: {
      definition: "Long-term vs. Short-term Orientation reflects your focus on future planning versus immediate results.",
      examples: ["High: Values long-term planning and persistence", "Low: Focuses on quick results and tradition"]
    },
    indulgence: {
      definition: "Indulgence vs. Restraint shows your approach to work-life balance and gratification.",
      examples: ["High: Values work-life balance and enjoyment", "Low: Values self-discipline and restraint"]
    }
  },
  values: {
    innovation: {
      definition: "Innovation vs. Stability reflects your preference for new approaches versus proven methods.",
      examples: ["High: Enjoys trying new solutions", "Low: Prefers reliable, tested approaches"]
    },
    collaboration: {
      definition: "Collaboration vs. Competition shows your preference for teamwork versus individual achievement.",
      examples: ["High: Values working together", "Low: Values individual excellence"]
    },
    autonomy: {
      definition: "Autonomy vs. Structure indicates your preference for independence versus clear guidelines.",
      examples: ["High: Prefers freedom to work independently", "Low: Prefers clear processes and structure"]
    },
    quality: {
      definition: "Quality vs. Speed reflects your priority between excellence and quick delivery.",
      examples: ["High: Takes time to ensure quality", "Low: Focuses on rapid delivery"]
    },
    customer_focus: {
      definition: "Customer Focus vs. Internal Focus shows your orientation toward external or internal priorities.",
      examples: ["High: Prioritizes customer needs", "Low: Focuses on internal efficiency"]
    }
  }
};

export default function TermExplanation({ term, definition, examples, category }: TermExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ocean': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'culture': return 'text-green-600 bg-green-50 border-green-200';
      case 'values': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className={`p-1 rounded-full ${getCategoryColor(category)}`}>
          <Info className="h-3 w-3" />
        </div>
        <span className="font-medium text-gray-900 capitalize">
          {term.replace('_', ' ')}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
        )}
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">{definition}</p>
          {examples && examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Examples:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TermGlossary({ category }: { category: 'ocean' | 'culture' | 'values' }) {
  const terms = termDefinitions[category];
  
  return (
    <div className="space-y-1">
      {Object.entries(terms).map(([term, details]) => (
        <TermExplanation
          key={term}
          term={term}
          definition={details.definition}
          examples={details.examples}
          category={category}
        />
      ))}
    </div>
  );
}
