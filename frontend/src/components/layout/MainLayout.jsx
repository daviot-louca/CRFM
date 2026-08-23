import Sidebar from "./admin/Sidebar";
import Navbar from "../ui/Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-bleu">
        <Sidebar />
      </aside>

      <div className="ml-64 min-h-screen flex flex-col">
        <header className="px-6">
          <Navbar />
        </header>

        <main className="flex-1 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
