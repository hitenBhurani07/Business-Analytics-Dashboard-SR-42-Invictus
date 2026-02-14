import { FiAlertCircle, FiClock, FiTrendingDown, FiAlertTriangle } from 'react-icons/fi';

const ProblemSection = () => {
    // Business owners ke main problems
    const problems = [
        {
            icon: <FiClock className="text-4xl text-danger" />,
            title: "Time-Consuming Operations",
            description: "Running a shop takes up so much time that we can't even think about business growth. Checking inventory every day, managing staff—we get tired.",
            example: "Example: The owner handles everything himself, from opening the shop at 6 am to closing it at 10 pm, leaving no time for strategy or growth."
        },
        {
            icon: <FiAlertCircle className="text-4xl text-warning" />,
            title: "Reactive Instead of Proactive",
            description: "Problems become apparent only after they've already occurred: after stock runs out, or after payments are late.",
            example: "Example: Suddenly stock out in Festival season, customer disappointed, sales loss"
        },
        {
            icon: <FiTrendingDown className="text-4xl text-danger" />,
            title: "Manual Tracking = Mistakes",
            description: "Register entries, Excel sheets, WhatsApp messages—everything is scattered. Small mistakes add up to big losses.",
            example: "Example: Forgetting payment to supplier, duplicate orders, calculation errors"
        },
        {
            icon: <FiAlertTriangle className="text-4xl text-warning" />,
            title: "Limited Staff, Unlimited Tasks",
            description: "The owner is manager, accountant, and salesperson all in one. Staff is small, work is heavy, and there's no proper system.",
            example: "Example: Delivery boy absent, owner personally delivers, shop closed"
        }
    ];

    return (
        <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 bg-cardBg">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-textMain mb-4">
                        Daily Struggles of Small Business  <span className="text-danger">Owners</span>
                    </h2>
                    <p className="text-lg text-textLight max-w-3xl mx-auto">
                        Do you face these problems every day? You're not alone – thousands of small business owners face similar challenges daily.
                    </p>
                </div>

                {/* Problems Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-danger"
                        >
                            {/* Icon */}
                            <div className="mb-4">
                                {problem.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-textMain mb-3">
                                {problem.title}
                            </h3>

                            {/* Description */}
                            <p className="text-textLight mb-4 leading-relaxed">
                                {problem.description}
                            </p>

                            {/* Example */}
                            <div className="bg-red-50 p-4 rounded-lg border-l-2 border-danger">
                                <p className="text-sm text-textMain italic">
                                    {problem.example}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16 bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-xl">
                    <h3 className="text-2xl font-bold text-textMain mb-3">
                        Do these problems seem familiar?
                    </h3>
                    <p className="text-textLight text-lg mb-6">
                        It's time to adopt a smart solution that works for you 24/7                    </p>
                    <button className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-all duration-300 shadow-lg">
                        See how VyapaarSaathi helps                    </button>
                </div>

            </div>
        </section>
    );
};

export default ProblemSection;