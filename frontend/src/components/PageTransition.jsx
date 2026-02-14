import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className="transition-opacity duration-500"
            style={{
                opacity: isVisible ? 1 : 0,
            }}
        >
            {children}
        </div>
    );
};

export default PageTransition;
