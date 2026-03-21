import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomePage() {
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  const features = [
    {
      icon: "📸",
      title: "Capture Clear Photos",
      description: "Take well-lit, focused photos of potholes from directly above if possible."
    },
    {
      icon: "📍",
      title: "Enable Location Services",
      description: "Allow location access so we can automatically tag the pothole location."
    },
    {
      icon: "🤖",
      title: "AI Verification",
      description: "Our AI system analyzes your photo to confirm it's a pothole with high accuracy."
    },
    {
      icon: "📊",
      title: "Track Progress",
      description: "Monitor the status of your reports from 'Reported' to 'Resolved'."
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Login or Register",
      description: "Create an account or sign in to start reporting potholes."
    },
    {
      step: 2,
      title: "Go to Map Page",
      description: "Navigate to the interactive map to see existing reports."
    },
    {
      step: 3,
      title: "Upload Photo",
      description: "Use the upload widget to select a pothole photo."
    },
    {
      step: 4,
      title: "Automatic Processing",
      description: "AI verifies the pothole and automatically records the location."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Report Potholes, 
            <span className="text-blue-500"> Make Roads Safer</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community-driven initiative to identify and report potholes. 
            Help your local authorities fix dangerous road conditions faster.
          </p>
          {currentUser ? (
            <div className="space-x-4">
              <Link 
                to="/map"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                🗺️ Go to Map
              </Link>
              <Link 
                to="/status"
                className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
              >
                📊 View My Reports
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link 
                to="/register"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/login"
                className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes reporting potholes simple and effective
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quick Start Guide</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to start reporting potholes today
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-start mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Guidelines */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Photo Guidelines</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            For best AI recognition results, follow these photography tips
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-green-50 p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-green-800 mb-4">Do's</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Take photos in good daylight</li>
              <li>• Capture from directly above if possible</li>
              <li>• Include some surrounding road for context</li>
              <li>• Ensure the pothole is clearly visible</li>
              <li>• Hold camera steady to avoid blur</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-red-800 mb-4">Don'ts</h3>
            <ul className="space-y-2 text-red-700">
              <li>• Don't take blurry or dark photos</li>
              <li>• Avoid extreme angles</li>
              <li>• Don't include personal information</li>
              <li>• Avoid photos with people/faces</li>
              <li>• Don't take photos while driving</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of citizens helping to make roads safer for everyone
            </p>
            {currentUser ? (
              <Link 
                to="/map"
                className="bg-white text-blue-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Report a Pothole Now
              </Link>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/register"
                  className="bg-white text-blue-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Join Now
                </Link>
                <Link 
                  to="/login"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-500 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">Pothole Grievance Reporter. Making roads safer, one report at a time.</p>
          <Link 
            to="/about" 
            className="text-blue-300 hover:text-white transition-colors underline"
          >
            Learn how we built this project →
          </Link>
        </div>
      </footer>
    </div>
  );
}