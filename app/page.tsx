import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Culture Mapping
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Understand your team's personality and culture dynamics
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link 
            href="/team/create"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Create Team</h2>
            <p className="text-gray-600">Start a new team assessment</p>
          </Link>
          
          <Link 
            href="/assessment/test-uuid"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Take Assessment</h2>
            <p className="text-gray-600">Complete the OCEAN personality test</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
