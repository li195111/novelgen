import { useCurrentStoryStorage } from '@/hooks/use-current-story-storage';
import React, { useEffect } from 'react';


interface HomePageProps {
}

const HomePage: React.FC<HomePageProps> = ({ }) => {
    const [currentStoryUid, setCurrentStoryUid] = useCurrentStoryStorage();

    useEffect(() => {
        setCurrentStoryUid('');
    }, [])

    return (
        <div>
            <h1>HomePage</h1>
        </div>
    );
}

export default HomePage;