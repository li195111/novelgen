import { useLocalStorage } from '@/hooks/use-storage';
import React, { useEffect } from 'react';


interface HomePageProps {
}

const HomePage: React.FC<HomePageProps> = ({ }) => {
    const [currentStoryUid, setCurrentStoryUid] = useLocalStorage<string>('current-story', '');

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