import { useStoryStorage } from '@/hooks/use-story-storage';
import React, { useEffect } from 'react';


interface HomePageProps {
}

const HomePage: React.FC<HomePageProps> = ({ }) => {
    const { setCurrentStoryUid } = useStoryStorage();

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