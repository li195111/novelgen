import "@/App.css";
import { ChatCard } from "@/components/ChatCard/chat-card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import HomePage from "@/pages/home";
import SettingsPage from "@/pages/settings";
import StoryPage from "@/pages/story";
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    <main className="relative flex w-full">
      <SidebarTrigger />
      <div className="flex flex-col pl-2 pr-4 pt-4 mb-[11rem] w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/story/:storyUid" element={<StoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <ChatCard />
    </main>
  );
}

export default App;
