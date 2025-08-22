import { createSampleData } from '../lib/data-service';

async function main() {
  console.log('🌱 Seeding database...');
  
  try {
    const { user, team, assessment } = await createSampleData();
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Sample data created:');
    console.log(`   👤 User: ${user.name} (${user.email})`);
    console.log(`   👥 Team: ${team.name} (Code: ${team.code})`);
    console.log(`   📝 Assessment: ${assessment.title} (ID: ${assessment.id})`);
    
    console.log('\n🔗 You can now test the application with real data:');
    console.log(`   Team Dashboard: http://localhost:3000/team/${team.code}/dashboard`);
    console.log(`   Assessment: http://localhost:3000/assessment/${assessment.id}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
