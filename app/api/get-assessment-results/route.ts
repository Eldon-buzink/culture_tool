import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    // Mock results - in a real app, this would come from a database
    const mockResults = {
      uuid,
      oceanScores: {
        openness: 85,
        conscientiousness: 92,
        extraversion: 78,
        agreeableness: 88,
        neuroticism: 45
      },
      cultureScores: {
        power_distance: 35,
        individualism: 72,
        masculinity: 45,
        uncertainty_avoidance: 28,
        long_term_orientation: 68,
        indulgence: 55
      },
      valuesScores: {
        innovation: 78,
        collaboration: 85,
        autonomy: 65,
        quality: 88,
        customer_focus: 82
      },
      completedAt: new Date().toISOString(),
      insights: {
        ocean: [
          "High openness indicates strong creativity and adaptability to new situations",
          "Excellent conscientiousness shows strong organization and reliability",
          "Good extraversion suggests comfortable social engagement",
          "High agreeableness indicates strong collaboration and team orientation",
          "Lower neuroticism suggests emotional stability and stress resilience"
        ],
        culture: [
          "Low power distance preference suggests egalitarian work style",
          "High individualism indicates preference for personal achievement",
          "Balanced masculinity shows both competitive and collaborative traits",
          "Low uncertainty avoidance suggests comfort with change and ambiguity",
          "High long-term orientation indicates strategic thinking",
          "Balanced indulgence shows good work-life balance awareness"
        ],
        values: [
          "High innovation preference suggests creative problem-solving approach",
          "Strong collaboration value indicates team-oriented work style",
          "Moderate autonomy preference shows balance between independence and structure",
          "High quality focus indicates attention to detail and excellence",
          "Strong customer focus suggests external orientation and service mindset"
        ]
      },
      recommendations: [
        {
          priority: 'high',
          title: 'Leverage Creative Problem Solving',
          description: 'Your high openness and innovation values make you excellent at creative solutions. Consider taking on projects that require innovative thinking.',
          category: 'Work Style',
          section: 'ocean',
          context: 'Your personality shows strong creative potential combined with a preference for innovative approaches.',
          nextSteps: [
            'Volunteer for brainstorming sessions and innovation projects',
            'Seek out roles that require creative problem-solving',
            'Document your creative ideas and share them with your team',
            'Consider taking design thinking or innovation workshops'
          ]
        },
        {
          priority: 'high',
          title: 'Mentor Team Members',
          description: 'Your high conscientiousness and collaboration values make you an ideal mentor for less experienced team members.',
          category: 'Leadership',
          section: 'ocean',
          context: 'Your personality traits suggest you have the patience and reliability needed for effective mentoring.',
          nextSteps: [
            'Offer to mentor junior team members or new hires',
            'Create knowledge-sharing sessions for your team',
            'Document processes and best practices for others',
            'Consider leadership development programs'
          ]
        },
        {
          priority: 'medium',
          title: 'Embrace Change Management',
          description: 'Your low uncertainty avoidance and high innovation values suggest you can help teams adapt to new processes and technologies.',
          category: 'Change Management',
          section: 'culture',
          context: 'Your cultural preferences show comfort with ambiguity and change, making you a natural change agent.',
          nextSteps: [
            'Volunteer to lead change initiatives in your organization',
            'Help colleagues understand and adapt to new processes',
            'Share your perspective on how to make transitions smoother',
            'Consider change management certification programs'
          ]
        },
        {
          priority: 'medium',
          title: 'Balance Social and Solo Work',
          description: 'While you enjoy collaboration, ensure you have dedicated time for focused individual work.',
          category: 'Work-Life Balance',
          section: 'ocean',
          context: 'Your personality shows good social engagement but also needs focused time for deep work.',
          nextSteps: [
            'Schedule dedicated "focus time" blocks in your calendar',
            'Communicate your need for uninterrupted work time to colleagues',
            'Find a quiet workspace for complex tasks',
            'Use productivity techniques like time-blocking'
          ]
        },
        {
          priority: 'low',
          title: 'Develop Strategic Planning Skills',
          description: 'Your long-term orientation and quality focus suggest you could excel in strategic planning roles.',
          category: 'Career Development',
          section: 'culture',
          context: 'Your cultural preferences show strong strategic thinking and quality orientation.',
          nextSteps: [
            'Take on projects with long-term strategic impact',
            'Learn strategic planning methodologies and tools',
            'Seek opportunities to contribute to organizational strategy',
            'Consider strategic planning or business strategy courses'
          ]
        },
        {
          priority: 'medium',
          title: 'Enhance Customer-Centric Approach',
          description: 'Your strong customer focus values combined with collaboration skills make you excellent at customer-facing roles.',
          category: 'Customer Relations',
          section: 'values',
          context: 'Your work values show a natural orientation toward understanding and serving customer needs.',
          nextSteps: [
            'Seek out customer-facing projects or roles',
            'Learn customer journey mapping and user experience design',
            'Practice active listening and empathy in customer interactions',
            'Consider customer success or product management roles'
          ]
        }
      ]
    };

    return NextResponse.json({
      success: true,
      results: mockResults,
    });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
