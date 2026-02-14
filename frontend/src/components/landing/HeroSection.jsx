import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section id="home" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          
          {/* Badge/Tag Line */}
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-6">
            <span className="text-accent font-semibold text-sm">
              Small Business Operations Simplified
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-textMain mb-6 leading-tight">
            Smarter Operations. Stronger Business.
            <br />
                
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-textLight max-w-3xl mx-auto mb-10">
            Stop firefighting daily operations. VyapaarSaathi monitors, predicts, and automates 
            routine business decisions so you can focus on growth, not just survival.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                Get Started Free
                <FiArrowRight className="text-xl" />
              </button>
            </Link>
            
            {/* <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-md flex items-center gap-2 border border-primary">
              <FiPlay className="text-xl" />
              Watch Demo
            </button> */}
          </div>

          {/* Stats Section (optional - business credibility ke liye) */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto ">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-3xl font-bold text-primary mb-2">80%</h3>
              <p className="text-textLight">Time Saved on Operations</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-3xl font-bold text-secondary mb-2">0 Missed Alerts</h3>
              <p className="text-textLight">Proactive Risk Detection</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-3xl font-bold text-accent mb-2">24/7</h3>
              <p className="text-textLight">Always-On Monitoring</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;