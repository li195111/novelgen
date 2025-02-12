import "@/App.css";
import { SidebarTrigger } from "@/components/ui/sidebar";
import HomePage from "@/pages/home";
import SettingsPage from "@/pages/settings";
import StoryPage from "@/pages/story";
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    <main className="flex w-full">
      <div className="flex flex-col w-7">
        <SidebarTrigger />
      </div>
      <div className="flex flex-col w-full p-2.5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/story/:storyUid" element={<StoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
