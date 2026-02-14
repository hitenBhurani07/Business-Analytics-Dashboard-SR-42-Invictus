import { FiCheckCircle, FiBell, FiTrendingUp, FiZap } from 'react-icons/fi';

const SolutionSection = () => {
  // Main Solutions
  const solutions = [
    {
      icon: <FiBell className="text-5xl text-secondary" />,
      title: "Proactive Alerts",
      description: "Get a warning before a problem occurs. Running low on stock? Alerts. Payment due? Reminders. Staff shortages expected? Notifications.",
      benefits: [
        "Real-time monitoring 24/7",
        "Smart predictions based on patterns",
        "WhatsApp/SMS instant notifications"
      ]
    },
    {
      icon: <FiZap className="text-5xl text-accent" />,
      title: "Automated Decisions",
      description: "Routine tasks are done automatically. When to place an order, how to create a staff schedule, when to send payment remittances—all automated.",
      benefits: [
        "80% routine tasks automatic",
        "Manual errors zero",
        "Time saved every day 3-4 hours"
      ]
    },
    {
      icon: <FiTrendingUp className="text-5xl text-primary" />,
      title: "Intelligent Recommendations",
      description: "Analyzing your business data provides smart suggestions: who is the best supplier, when are peak times, and what are slow-moving items.",
      benefits: [
        "Data-driven insights",
        "Better business decisions",
        "Profit margins improve"
      ]
    },
    {
      icon: <FiCheckCircle className="text-5xl text-success" />,
      title: "Simple Integration",
      description: "Excel sheets, WhatsApp, existing systems—everything connects. No technical knowledge required. Setup in 15 minutes.",
      benefits: [
        "No coding required",
        "Works with existing tools",
        "User-friendly dashboard"
      ]
    }
  ];

  return (
    <section id="solution" className="py-1 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-4">
            <span className="text-success font-semibold text-sm">
              Smart Solution
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-textMain mb-4">
            VyapaarSathi: Your <span className="text-primary">24/7 Operations Manager</span>
          </h2>
          <p className="text-lg text-textLight max-w-3xl mx-auto">
            An intelligent assistant that continuously monitors, predicts problems, and automatically handles routine operations – just like you're an experienced manager!
          </p>
        </div>

        {/* How It Changes Things */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-textMain mb-4">
                Before VyapaarSaathi 
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-danger text-xl">✗</span>
                  <span className="text-textLight">Everything had to be tracked manually.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-xl">✗</span>
                  <span className="text-textLight">Problems become apparent when it is already late.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-xl">✗</span>
                  <span className="text-textLight">Reactive mode constantly firefighting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-xl">✗</span>
                  <span className="text-textLight">There is no time to think about growth.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-textMain mb-4">
                With VyapaarSaathi 
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✓</span>
                  <span className="text-textLight">Automatic monitoring aur tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✓</span>
                  <span className="text-textLight">Alerts and solutions before problems arise</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✓</span>
                  <span className="text-textLight">Proactive decisions and smart planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✓</span>
                  <span className="text-textLight">Focus on strategy aur business growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <div 
              key={index}
              className="bg-cardBg p-8 rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary"
            >
              {/* Icon */}
              <div className="mb-6">
                {solution.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-textMain mb-3">
                {solution.title}
              </h3>

              {/* Description */}
              <p className="text-textLight mb-6 leading-relaxed">
                {solution.description}
              </p>

              {/* Benefits List */}
              <div className="space-y-2">
                {solution.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <FiCheckCircle className="text-success flex-shrink-0" />
                    <span className="text-sm text-textLight">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>



      </div>
    </section>
  );
};

export default SolutionSection;