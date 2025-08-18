import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uuid, responses } = await request.json();

    // Calculate OCEAN scores
    const oceanScores = calculateOCEANScores(responses);
    
    // Calculate Culture Map scores
    const cultureScores = calculateCultureScores(responses);
    
    // Calculate Team Values scores
    const valuesScores = calculateValuesScores(responses);

    // Store results (in a real app, this would go to a database)
    const results = {
      uuid,
      oceanScores,
      cultureScores,
      valuesScores,
      responses,
      completedAt: new Date().toISOString(),
    };

    // For now, we'll just return the results
    // In a real app, you'd store this in a database
    console.log('Assessment results:', results);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error submitting responses:', error);
    return NextResponse.json(
      { error: 'Failed to submit responses' },
      { status: 500 }
    );
  }
}

function calculateOCEANScores(responses: Record<string, number>) {
  const oceanQuestions = {
    openness: ['ocean_5', 'ocean_10', 'ocean_15', 'ocean_20'],
    conscientiousness: ['ocean_3', 'ocean_8', 'ocean_13', 'ocean_18'],
    extraversion: ['ocean_1', 'ocean_6', 'ocean_11', 'ocean_16'],
    agreeableness: ['ocean_2', 'ocean_7', 'ocean_12', 'ocean_17'],
    neuroticism: ['ocean_4', 'ocean_9', 'ocean_14', 'ocean_19'],
  };

  const reverseScored = {
    'ocean_6': true, 'ocean_7': true, 'ocean_8': true, 'ocean_9': true, 'ocean_10': true,
    'ocean_15': true, 'ocean_16': true, 'ocean_17': true, 'ocean_18': true, 'ocean_19': true, 'ocean_20': true,
  };

  const scores: Record<string, number> = {};

  Object.entries(oceanQuestions).forEach(([trait, questionIds]) => {
    const traitResponses = questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined);

    if (traitResponses.length === 0) {
      scores[trait] = 0;
      return;
    }

    const adjustedResponses = traitResponses.map((response, index) => {
      const questionId = questionIds[index];
      return reverseScored[questionId] ? (8 - response) : response;
    });

    const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
    scores[trait] = Math.round((average / 7) * 100);
  });

  return scores;
}

function calculateCultureScores(responses: Record<string, number>) {
  const cultureQuestions = {
    power_distance: ['culture_1', 'culture_2'],
    individualism: ['culture_3', 'culture_4'],
    masculinity: ['culture_5', 'culture_6'],
    uncertainty_avoidance: ['culture_7', 'culture_8'],
    long_term_orientation: ['culture_9', 'culture_10'],
    indulgence: ['culture_11', 'culture_12'],
  };

  const reverseScored = {
    'culture_2': true, 'culture_4': true, 'culture_6': true, 'culture_8': true, 'culture_10': true, 'culture_12': true,
  };

  const scores: Record<string, number> = {};

  Object.entries(cultureQuestions).forEach(([dimension, questionIds]) => {
    const dimensionResponses = questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined);

    if (dimensionResponses.length === 0) {
      scores[dimension] = 0;
      return;
    }

    const adjustedResponses = dimensionResponses.map((response, index) => {
      const questionId = questionIds[index];
      return reverseScored[questionId] ? (8 - response) : response;
    });

    const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
    scores[dimension] = Math.round((average / 7) * 100);
  });

  return scores;
}

function calculateValuesScores(responses: Record<string, number>) {
  const valuesQuestions = {
    innovation: ['values_1', 'values_2'],
    collaboration: ['values_3', 'values_4'],
    autonomy: ['values_5', 'values_6'],
    quality: ['values_7', 'values_8'],
    customer_focus: ['values_9', 'values_10'],
  };

  const reverseScored = {
    'values_2': true, 'values_4': true, 'values_6': true, 'values_8': true, 'values_10': true,
  };

  const scores: Record<string, number> = {};

  Object.entries(valuesQuestions).forEach(([value, questionIds]) => {
    const valueResponses = questionIds
      .map(id => responses[id])
      .filter(response => response !== undefined);

    if (valueResponses.length === 0) {
      scores[value] = 0;
      return;
    }

    const adjustedResponses = valueResponses.map((response, index) => {
      const questionId = questionIds[index];
      return reverseScored[questionId] ? (8 - response) : response;
    });

    const average = adjustedResponses.reduce((sum, response) => sum + response, 0) / adjustedResponses.length;
    scores[value] = Math.round((average / 7) * 100);
  });

  return scores;
}
