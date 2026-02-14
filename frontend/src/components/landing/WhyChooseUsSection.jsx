import {
    FiDollarSign,
    FiSmartphone,
    FiClock,
    FiHeart,
    FiShield,
    FiZap,
    FiAward,
    FiUsers
} from 'react-icons/fi';

const WhyChooseUsSection = () => {
    const advantages = [
        {
            icon: <FiDollarSign className="text-4xl" />,
            title: "Affordable Pricing",
            description: "Enterprise-level features, small business pricing. World-class operations management for a pittance!",
            highlight: "Starting at ₹999/month",
            color: "text-success"
        },
        {
            icon: <FiSmartphone className="text-4xl" />,
            title: "Mobile-First Design",
            description: "Manage your entire business from your smartphone. The app is lightweight and works even when your internet is low.",
            highlight: "Works on basic smartphones too",
            color: "text-primary"
        },
        {
            icon: <FiClock className="text-4xl" />,
            title: "15-Minute Setup",
            description: "No technical knowledge required. If you know how to use WhatsApp, you can use Google+!",
            highlight: "No training required",
            color: "text-warning"
        },
        {
            icon: <FiHeart className="text-4xl" />,
            title: "Built FOR Small Businesses",
            description: "Specially designed not for big corporates, but for small business owners like you.",
            highlight: "Made in India, for India",
            color: "text-danger"
        },
        {
            icon: <FiShield className="text-4xl" />,
            title: "Data Security",
            description: "Your business data is completely safe. Bank-level encryption and regular backups are automatic.",
            highlight: "99.9% uptime guarantee",
            color: "text-accent"
        },
        {
            icon: <FiZap className="text-4xl" />,
            title: "Real-Time Alerts",
            description: "WhatsApp, SMS, email - alerts wherever you want them. Never miss important notifications.",
            highlight: "Instant notifications",
            color: "text-primary"
        }
    ];



    return (
        <section id="why-choose-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full mb-4">
                        <span className="text-warning font-semibold text-sm">
                            Why We're Different
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-textMain mb-4">
                        <span className="text-primary">Why choose us?</span>
                    </h2>
                    <p className="text-lg text-textLight max-w-3xl mx-auto">
                        Other solutions are expensive, complicated, and for large businesses.
VyapaarSaathi is made just for small business owners like you!
                    </p>
                </div>

                {/* Advantages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {advantages.map((advantage, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-t-4 border-primary"
                        >
                            {/* Icon */}
                            <div className={`${advantage.color} mb-4`}>
                                {advantage.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-textMain mb-3">
                                {advantage.title}
                            </h3>

                            {/* Description */}
                            <p className="text-textLight mb-4 leading-relaxed">
                                {advantage.description}
                            </p>

                            {/* Highlight */}
                            <div className="bg-green-50 px-4 py-2 rounded-lg inline-block">
                                <span className="text-success font-semibold text-sm">
                                    ✓ {advantage.highlight}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>








            </div>
        </section>
    );
};

export default WhyChooseUsSection;