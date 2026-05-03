import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
}
