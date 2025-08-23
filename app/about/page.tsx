export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Culture Mapping Tool
          </h1>
          <p className="text-xl text-gray-600">
            Understanding team dynamics through comprehensive assessments
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What We Do
          </h2>
          <p className="text-gray-700 mb-4">
            Our culture mapping tool helps teams understand their dynamics through three key assessments:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>OCEAN Personality Assessment:</strong> Measures the Big Five personality traits</li>
            <li><strong>Cultural Preferences:</strong> Analyzes work style and communication preferences</li>
            <li><strong>Work Values:</strong> Identifies what motivates and drives team members</li>
          </ul>
          
          <p className="text-gray-700 mb-6">
            Using AI-powered insights, we provide personalized recommendations for team collaboration, 
            conflict resolution, and optimal team composition.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🚀 Coming Soon
            </h3>
            <p className="text-blue-800">
              We're continuously improving our tool with new features and insights. 
              Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
