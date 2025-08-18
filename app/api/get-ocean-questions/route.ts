import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // OCEAN Personality Questions
    const oceanQuestions = [
      {
        id: 'ocean_1',
        text: 'I am the life of the party',
        section: 'ocean',
        subsection: 'extraversion',
        reverse_scored: false,
        trait_axis: 'extraversion',
      },
      {
        id: 'ocean_2',
        text: 'I sympathize with others\' feelings',
        section: 'ocean',
        subsection: 'agreeableness',
        reverse_scored: false,
        trait_axis: 'agreeableness',
      },
      {
        id: 'ocean_3',
        text: 'I get chores done right away',
        section: 'ocean',
        subsection: 'conscientiousness',
        reverse_scored: false,
        trait_axis: 'conscientiousness',
      },
      {
        id: 'ocean_4',
        text: 'I have frequent mood swings',
        section: 'ocean',
        subsection: 'neuroticism',
        reverse_scored: false,
        trait_axis: 'neuroticism',
      },
      {
        id: 'ocean_5',
        text: 'I have a vivid imagination',
        section: 'ocean',
        subsection: 'openness',
        reverse_scored: false,
        trait_axis: 'openness',
      },
      {
        id: 'ocean_6',
        text: 'I don\'t talk a lot',
        section: 'ocean',
        subsection: 'extraversion',
        reverse_scored: true,
        trait_axis: 'extraversion',
      },
      {
        id: 'ocean_7',
        text: 'I am not interested in other people\'s problems',
        section: 'ocean',
        subsection: 'agreeableness',
        reverse_scored: true,
        trait_axis: 'agreeableness',
      },
      {
        id: 'ocean_8',
        text: 'I often forget to put things back in their proper place',
        section: 'ocean',
        subsection: 'conscientiousness',
        reverse_scored: true,
        trait_axis: 'conscientiousness',
      },
      {
        id: 'ocean_9',
        text: 'I am relaxed most of the time',
        section: 'ocean',
        subsection: 'neuroticism',
        reverse_scored: true,
        trait_axis: 'neuroticism',
      },
      {
        id: 'ocean_10',
        text: 'I am not interested in abstract ideas',
        section: 'ocean',
        subsection: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
      {
        id: 'ocean_11',
        text: 'I talk to a lot of different people at parties',
        section: 'ocean',
        subsection: 'extraversion',
        reverse_scored: false,
        trait_axis: 'extraversion',
      },
      {
        id: 'ocean_12',
        text: 'I feel others\' emotions',
        section: 'ocean',
        subsection: 'agreeableness',
        reverse_scored: false,
        trait_axis: 'agreeableness',
      },
      {
        id: 'ocean_13',
        text: 'I like order',
        section: 'ocean',
        subsection: 'conscientiousness',
        reverse_scored: false,
        trait_axis: 'conscientiousness',
      },
      {
        id: 'ocean_14',
        text: 'I get upset easily',
        section: 'ocean',
        subsection: 'neuroticism',
        reverse_scored: false,
        trait_axis: 'neuroticism',
      },
      {
        id: 'ocean_15',
        text: 'I have difficulty understanding abstract ideas',
        section: 'ocean',
        subsection: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
      {
        id: 'ocean_16',
        text: 'I keep in the background',
        section: 'ocean',
        subsection: 'extraversion',
        reverse_scored: true,
        trait_axis: 'extraversion',
      },
      {
        id: 'ocean_17',
        text: 'I am not really interested in others',
        section: 'ocean',
        subsection: 'agreeableness',
        reverse_scored: true,
        trait_axis: 'agreeableness',
      },
      {
        id: 'ocean_18',
        text: 'I make a mess of things',
        section: 'ocean',
        subsection: 'conscientiousness',
        reverse_scored: true,
        trait_axis: 'conscientiousness',
      },
      {
        id: 'ocean_19',
        text: 'I seldom feel blue',
        section: 'ocean',
        subsection: 'neuroticism',
        reverse_scored: true,
        trait_axis: 'neuroticism',
      },
      {
        id: 'ocean_20',
        text: 'I do not have a good imagination',
        section: 'ocean',
        subsection: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
    ];

    // Culture Map Questions (Hofstede Dimensions)
    const cultureQuestions = [
      {
        id: 'culture_1',
        text: 'I prefer clear hierarchies and respect for authority in the workplace',
        section: 'culture',
        subsection: 'power_distance',
        reverse_scored: false,
        trait_axis: 'power_distance',
      },
      {
        id: 'culture_2',
        text: 'I believe everyone should have equal say in decisions, regardless of position',
        section: 'culture',
        subsection: 'power_distance',
        reverse_scored: true,
        trait_axis: 'power_distance',
      },
      {
        id: 'culture_3',
        text: 'I work best when I can focus on my individual tasks and achievements',
        section: 'culture',
        subsection: 'individualism',
        reverse_scored: false,
        trait_axis: 'individualism',
      },
      {
        id: 'culture_4',
        text: 'I prefer working as part of a team and sharing collective success',
        section: 'culture',
        subsection: 'individualism',
        reverse_scored: true,
        trait_axis: 'individualism',
      },
      {
        id: 'culture_5',
        text: 'I enjoy competitive environments where I can prove my abilities',
        section: 'culture',
        subsection: 'masculinity',
        reverse_scored: false,
        trait_axis: 'masculinity',
      },
      {
        id: 'culture_6',
        text: 'I prefer collaborative environments focused on mutual support and growth',
        section: 'culture',
        subsection: 'masculinity',
        reverse_scored: true,
        trait_axis: 'masculinity',
      },
      {
        id: 'culture_7',
        text: 'I need clear rules and procedures to feel comfortable at work',
        section: 'culture',
        subsection: 'uncertainty_avoidance',
        reverse_scored: false,
        trait_axis: 'uncertainty_avoidance',
      },
      {
        id: 'culture_8',
        text: 'I enjoy flexible situations where I can adapt to changing circumstances',
        section: 'culture',
        subsection: 'uncertainty_avoidance',
        reverse_scored: true,
        trait_axis: 'uncertainty_avoidance',
      },
      {
        id: 'culture_9',
        text: 'I focus on long-term goals and future planning in my work',
        section: 'culture',
        subsection: 'long_term_orientation',
        reverse_scored: false,
        trait_axis: 'long_term_orientation',
      },
      {
        id: 'culture_10',
        text: 'I prefer to focus on immediate results and short-term achievements',
        section: 'culture',
        subsection: 'long_term_orientation',
        reverse_scored: true,
        trait_axis: 'long_term_orientation',
      },
      {
        id: 'culture_11',
        text: 'I believe in maintaining a good work-life balance and enjoying life',
        section: 'culture',
        subsection: 'indulgence',
        reverse_scored: false,
        trait_axis: 'indulgence',
      },
      {
        id: 'culture_12',
        text: 'I believe in self-discipline and controlling desires for long-term success',
        section: 'culture',
        subsection: 'indulgence',
        reverse_scored: true,
        trait_axis: 'indulgence',
      },
    ];

    // Team Values Questions
    const valuesQuestions = [
      {
        id: 'values_1',
        text: 'I prefer trying new approaches and innovative solutions',
        section: 'values',
        subsection: 'innovation',
        reverse_scored: false,
        trait_axis: 'innovation',
      },
      {
        id: 'values_2',
        text: 'I prefer proven methods and stable, reliable processes',
        section: 'values',
        subsection: 'innovation',
        reverse_scored: true,
        trait_axis: 'innovation',
      },
      {
        id: 'values_3',
        text: 'I believe success comes from working together as a team',
        section: 'values',
        subsection: 'collaboration',
        reverse_scored: false,
        trait_axis: 'collaboration',
      },
      {
        id: 'values_4',
        text: 'I believe success comes from individual excellence and competition',
        section: 'values',
        subsection: 'collaboration',
        reverse_scored: true,
        trait_axis: 'collaboration',
      },
      {
        id: 'values_5',
        text: 'I prefer having freedom to work in my own way',
        section: 'values',
        subsection: 'autonomy',
        reverse_scored: false,
        trait_axis: 'autonomy',
      },
      {
        id: 'values_6',
        text: 'I prefer having clear guidelines and structured processes',
        section: 'values',
        subsection: 'autonomy',
        reverse_scored: true,
        trait_axis: 'autonomy',
      },
      {
        id: 'values_7',
        text: 'I believe in taking time to ensure the highest quality output',
        section: 'values',
        subsection: 'quality',
        reverse_scored: false,
        trait_axis: 'quality',
      },
      {
        id: 'values_8',
        text: 'I believe in delivering results quickly, even if it means some imperfections',
        section: 'values',
        subsection: 'quality',
        reverse_scored: true,
        trait_axis: 'quality',
      },
      {
        id: 'values_9',
        text: 'I focus on understanding and meeting customer needs',
        section: 'values',
        subsection: 'customer_focus',
        reverse_scored: false,
        trait_axis: 'customer_focus',
      },
      {
        id: 'values_10',
        text: 'I focus on internal processes and organizational efficiency',
        section: 'values',
        subsection: 'customer_focus',
        reverse_scored: true,
        trait_axis: 'customer_focus',
      },
    ];

    const allQuestions = [...oceanQuestions, ...cultureQuestions, ...valuesQuestions];

    // Section explanations
    const sectionExplanations = {
      ocean: {
        title: "Personality Assessment (OCEAN)",
        description: "This section helps us understand your core personality traits using the scientifically validated OCEAN model. Your responses will reveal how you naturally think, feel, and behave in different situations.",
        outcome: "You'll discover your unique personality profile across five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. This helps identify your natural strengths and work preferences."
      },
      culture: {
        title: "Cultural Work Preferences",
        description: "This section explores your cultural work style preferences based on Hofstede's cultural dimensions. We'll understand how you prefer to interact with authority, work with others, and approach uncertainty.",
        outcome: "You'll see your cultural work profile showing preferences for hierarchy, teamwork style, risk tolerance, and long-term thinking. This helps teams understand how to work together effectively."
      },
      values: {
        title: "Team Values & Priorities",
        description: "This section identifies your core work values and priorities. We'll understand what drives you, how you prefer to achieve goals, and what you value most in a work environment.",
        outcome: "You'll discover your value priorities across key dimensions like innovation vs. stability, collaboration vs. competition, and quality vs. speed. This helps align team goals and work approaches."
      }
    };

    return NextResponse.json({
      success: true,
      questions: allQuestions,
      sectionExplanations,
    });
  } catch (error) {
    console.error('Error fetching assessment questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
