import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'team@example.com' },
    update: {},
    create: {
      email: 'team@example.com',
      name: 'Team Member'
    }
  });

  console.log('✅ Users created:', { user1: user1.email, user2: user2.email });

  // Create sample team
  const team = await prisma.team.upsert({
    where: { code: 'SAMPLE' },
    update: {},
    create: {
      name: 'Sample Team',
      description: 'A sample team for testing',
      code: 'SAMPLE'
    }
  });

  console.log('✅ Team created:', team.name);

  // Create team members
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user1.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: user1.id,
      role: 'owner'
    }
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user2.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: user2.id,
      role: 'member'
    }
  });

  console.log('✅ Team members created');

  // Create sample assessment
  const assessment = await prisma.assessment.upsert({
    where: { id: 'sample-assessment' },
    update: {},
    create: {
      id: 'sample-assessment',
      title: 'Sample Assessment',
      description: 'A sample assessment for testing',
      type: 'individual',
      status: 'completed',
      createdBy: user1.id
    }
  });

  console.log('✅ Assessment created:', assessment.title);

  // Create sample assessment results
  await prisma.assessmentResult.upsert({
    where: { assessmentId: assessment.id },
    update: {},
    create: {
      assessmentId: assessment.id,
      oceanOpenness: 75,
      oceanConscientiousness: 60,
      oceanExtraversion: 80,
      oceanAgreeableness: 70,
      oceanNeuroticism: 30,
      culturePowerDistance: 40,
      cultureIndividualism: 70,
      cultureMasculinity: 50,
      cultureUncertaintyAvoidance: 60,
      cultureLongTermOrientation: 65,
      cultureIndulgence: 55,
      valuesInnovation: 80,
      valuesCollaboration: 75,
      valuesAutonomy: 70,
      valuesQuality: 85,
      valuesCustomerFocus: 65,
      insights: JSON.stringify({
        ocean: [
          "You show high openness to new experiences, indicating creativity and adaptability.",
          "Your extraversion suggests you thrive in social and collaborative environments.",
          "Moderate conscientiousness suggests a balanced approach to planning and spontaneity."
        ],
        culture: [
          "You prefer egalitarian work environments with low power distance.",
          "Your individualism indicates you value personal achievement and autonomy.",
          "Moderate uncertainty avoidance suggests you can handle both structured and flexible environments."
        ],
        values: [
          "Innovation and quality are your top work values, driving your professional choices.",
          "You value collaboration while maintaining a strong sense of autonomy.",
          "Customer focus indicates your commitment to delivering value to others."
        ]
      }),
      recommendations: JSON.stringify({
        ocean: {
          context: "Based on your OCEAN personality profile, you're naturally inclined toward creative, social, and adaptable work environments.",
          recommendations: [
            {
              title: "Leverage Your Openness and Extraversion",
              description: "Seek roles that allow you to explore new ideas and work with diverse teams. Your natural curiosity and social energy can drive innovation and team collaboration.",
              nextSteps: [
                "Look for roles in creative industries or innovation teams",
                "Seek opportunities to lead collaborative projects",
                "Consider roles that involve client interaction or public speaking"
              ]
            }
          ]
        },
        culture: {
          context: "Your cultural preferences suggest you work best in flat organizational structures with high autonomy and clear communication.",
          recommendations: [
            {
              title: "Find Your Cultural Fit",
              description: "Look for organizations with flat hierarchies, transparent communication, and opportunities for individual contribution within team contexts.",
              nextSteps: [
                "Research company cultures before applying",
                "Ask about organizational structure in interviews",
                "Seek companies that value individual initiative"
              ]
            }
          ]
        },
        values: {
          context: "Your work values indicate a strong drive for innovation and quality, balanced with collaboration and customer focus.",
          recommendations: [
            {
              title: "Align Work with Your Values",
              description: "Focus on roles that allow you to innovate while maintaining high standards and working with others toward customer-focused goals.",
              nextSteps: [
                "Target roles in product development or innovation",
                "Look for quality-focused organizations",
                "Seek positions that balance individual and team work"
              ]
            }
          ]
        }
      })
    }
  });

  console.log('✅ Assessment results created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
