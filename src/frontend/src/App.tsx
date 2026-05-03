/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RegistrationScreen } from "./screens/RegistrationScreen";
import { ProfileInputScreen } from "./screens/ProfileInputScreen";
import { PreferencesScreen } from "./screens/PreferencesScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { ProfileConfirmationScreen } from "./screens/ProfileConfirmationScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SidebarProvider } from "./contexts/SidebarContext";

export default function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<RegistrationScreen />} />
            <Route path="/profile-input" element={<ProfileInputScreen />} />
            <Route path="/preferences" element={<PreferencesScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/profile-confirmation" element={<ProfileConfirmationScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}
