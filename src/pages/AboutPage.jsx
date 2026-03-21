import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const techStack = [
    {
      category: "Frontend",
      items: ["React.js", "Tailwind CSS", "Leaflet Maps", "Framer Motion"]
    },
    {
      category: "Backend", 
      items: ["Node.js", "Express.js", "MongoDB", "Mongoose ODM"]
    },
    {
      category: "Authentication",
      items: ["JWT Tokens", "bcrypt Password Hashing", "Role-based Access"]
    },
    {
      category: "AI/ML",
      items: ["Custom CNN Model", "TensorFlow/Keras", "Image Classification"]
    },
    {
      category: "File Handling",
      items: ["Multer", "Sharp Image Processing", "EXIF Data Extraction"]
    },
    {
      category: "APIs & Services",
      items: ["RESTful APIs", "CORS Configuration", "Geolocation Services"]
    }
  ];

  const features = [
    {
      title: "AI-Powered Detection",
      description: "Custom trained CNN model that automatically verifies potholes from uploaded images with high accuracy."
    },
    {
      title: "Real-time Geolocation",
      description: "Automatic location tagging using EXIF data and manual map selection for precise pothole reporting."
    },
    {
      title: "User Management",
      description: "Secure authentication system with role-based access (Admin/User) and profile management."
    },
    {
      title: "Interactive Dashboard",
      description: "Admin panel for managing users, updating pothole status, and viewing system analytics."
    },
    {
      title: "Responsive Design",
      description: "Mobile-first approach ensuring seamless experience across all devices and screen sizes."
    },
    {
      title: "Status Tracking",
      description: "Complete workflow from 'Reported' to 'Resolved' with progress tracking for users."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Pothole Grievance Reporter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A community-driven platform leveraging AI and modern web technologies to make road maintenance more efficient and transparent.
          </p>
        </motion.div>

        {/* Project Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-8 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Pothole Grievance Reporter was born from the simple observation that road maintenance often relies on manual reporting and inspection processes. We wanted to create a solution that empowers citizens to actively participate in improving their local infrastructure while providing authorities with verified, actionable data.
            </p>
            <p className="mb-4">
              Our platform combines the power of artificial intelligence with user-friendly web technologies to create a seamless reporting experience. The AI model was custom-trained on thousands of pothole images to accurately verify user submissions, reducing false reports and ensuring data quality.
            </p>
            <p>
              Built with modern web development practices, Pothole Grievance Reporter demonstrates how technology can bridge the gap between community needs and municipal services, creating a more responsive and efficient public infrastructure maintenance system.
            </p>
          </div>
        </motion.section>

        {/* Technology Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-4">{tech.category}</h3>
                <ul className="space-y-2">
                  {tech.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-green-600 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Development Process */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-8 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Development Journey</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Research & Planning</h3>
                <p className="text-gray-700">Analyzed existing solutions, defined user personas, and created technical specifications for both frontend and backend architecture.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Model Development</h3>
                <p className="text-gray-700">Collected and labeled pothole image dataset, trained convolutional neural network, and integrated model with backend API.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Full-Stack Development</h3>
                <p className="text-gray-700">Built RESTful APIs with Node.js/Express, developed responsive React frontend, and implemented real-time map features.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Testing & Deployment</h3>
                <p className="text-gray-700">Comprehensive testing of all features, security implementation, and deployment with proper CORS and environment configuration.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link 
            to="/"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}