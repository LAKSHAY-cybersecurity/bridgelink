import DashboardSidebar from "./DashboardSidebar";
import MobileHeader from "./MobileHeader";
import NotificationBell from "./NotificationBell";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { useLocation } from "react-router-dom";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const pageContext = location.pathname.replace("/dashboard", "").replace("/", "") || "dashboard";

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <MobileHeader />
        <div className="hidden lg:flex sticky top-0 z-40 items-center justify-end gap-3 px-10 py-3 glass-strong border-b border-border/50">
          <NotificationBell />
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {children}
        </div>
      </div>
      <ChatbotWidget pageContext={pageContext} />
    </div>
  );
};

export default DashboardLayout;
