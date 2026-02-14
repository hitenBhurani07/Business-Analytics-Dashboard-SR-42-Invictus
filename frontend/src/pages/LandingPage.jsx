import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import WhyChooseUsSection from '../components/landing/WhyChooseUsSection';

import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <WhyChooseUsSection />
            <Footer />
        </div>
    );
};

export default LandingPage;