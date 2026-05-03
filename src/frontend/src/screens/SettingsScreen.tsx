import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  LogOut, 
  Trash2, 
  FileText, 
  Shield, 
  Bell, 
  Globe, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState("en");

  const handleLogout = () => {
    // In a real app, clear auth state here
    navigate("/");
  };

  const handleDeleteAccount = () => {
    // In a real app, show confirmation modal and delete account
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      navigate("/");
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 text-base">Manage your account preferences and application settings.</p>
          </div>

          <div className="space-y-10">
            {/* Preferences Section */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Preferences</h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Notifications */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">Receive job matches and updates via email</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#113a7a]"></div>
                  </label>
                </div>

                <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-500">Get notified instantly when employers reply</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#113a7a]"></div>
                  </label>
                </div>

                {/* Language */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Language</div>
                      <div className="text-sm text-gray-500">Select your preferred language</div>
                    </div>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#5c9be6] focus:border-[#5c9be6] block p-2.5 outline-none"
                  >
                    <option value="en">English</option>
                    <option value="zh-CN">Mandarin (普通话)</option>
                    <option value="zh-HK">Cantonese (粵語)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Support & Legal Section */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support & Legal</h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-gray-900">Help & Support</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-gray-900">Terms of Service</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-gray-900">Privacy Policy</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </section>

            {/* Account Actions Section */}
            <section>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-4">Account Actions</h2>
              <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={handleLogout}
                  className="w-full p-4 border-b border-red-50 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-red-600">Log out</div>
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-red-600">Delete account</div>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
