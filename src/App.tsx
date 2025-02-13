import "@/App.css";
import { ChatCard } from "@/components/chat-card";
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
      <div className="flex flex-col pl-2 pt-4 mb-[11rem] w-[44rem]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/story/:storyUid" element={<StoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <div className="fixed bottom-0 flex justify-center pl-9 w-[45.75rem] mb-4">
        <ChatCard />
      </div>
    </main>
  );
}

export default App;
