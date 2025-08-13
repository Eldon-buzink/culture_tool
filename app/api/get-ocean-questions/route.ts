import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock OCEAN questions - in a real app, these would come from a database
    const questions = [
      {
        id: '1',
        text: 'I am the life of the party',
        section: 'extraversion',
        reverse_scored: false,
        trait_axis: 'extraversion',
      },
      {
        id: '2',
        text: 'I sympathize with others\' feelings',
        section: 'agreeableness',
        reverse_scored: false,
        trait_axis: 'agreeableness',
      },
      {
        id: '3',
        text: 'I get chores done right away',
        section: 'conscientiousness',
        reverse_scored: false,
        trait_axis: 'conscientiousness',
      },
      {
        id: '4',
        text: 'I have frequent mood swings',
        section: 'neuroticism',
        reverse_scored: false,
        trait_axis: 'neuroticism',
      },
      {
        id: '5',
        text: 'I have a vivid imagination',
        section: 'openness',
        reverse_scored: false,
        trait_axis: 'openness',
      },
      {
        id: '6',
        text: 'I don\'t talk a lot',
        section: 'extraversion',
        reverse_scored: true,
        trait_axis: 'extraversion',
      },
      {
        id: '7',
        text: 'I am not interested in other people\'s problems',
        section: 'agreeableness',
        reverse_scored: true,
        trait_axis: 'agreeableness',
      },
      {
        id: '8',
        text: 'I often forget to put things back in their proper place',
        section: 'conscientiousness',
        reverse_scored: true,
        trait_axis: 'conscientiousness',
      },
      {
        id: '9',
        text: 'I am relaxed most of the time',
        section: 'neuroticism',
        reverse_scored: true,
        trait_axis: 'neuroticism',
      },
      {
        id: '10',
        text: 'I am not interested in abstract ideas',
        section: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
      {
        id: '11',
        text: 'I talk to a lot of different people at parties',
        section: 'extraversion',
        reverse_scored: false,
        trait_axis: 'extraversion',
      },
      {
        id: '12',
        text: 'I feel others\' emotions',
        section: 'agreeableness',
        reverse_scored: false,
        trait_axis: 'agreeableness',
      },
      {
        id: '13',
        text: 'I like order',
        section: 'conscientiousness',
        reverse_scored: false,
        trait_axis: 'conscientiousness',
      },
      {
        id: '14',
        text: 'I get upset easily',
        section: 'neuroticism',
        reverse_scored: false,
        trait_axis: 'neuroticism',
      },
      {
        id: '15',
        text: 'I have difficulty understanding abstract ideas',
        section: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
      {
        id: '16',
        text: 'I keep in the background',
        section: 'extraversion',
        reverse_scored: true,
        trait_axis: 'extraversion',
      },
      {
        id: '17',
        text: 'I am not really interested in others',
        section: 'agreeableness',
        reverse_scored: true,
        trait_axis: 'agreeableness',
      },
      {
        id: '18',
        text: 'I make a mess of things',
        section: 'conscientiousness',
        reverse_scored: true,
        trait_axis: 'conscientiousness',
      },
      {
        id: '19',
        text: 'I seldom feel blue',
        section: 'neuroticism',
        reverse_scored: true,
        trait_axis: 'neuroticism',
      },
      {
        id: '20',
        text: 'I do not have a good imagination',
        section: 'openness',
        reverse_scored: true,
        trait_axis: 'openness',
      },
    ];

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('Error fetching OCEAN questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
