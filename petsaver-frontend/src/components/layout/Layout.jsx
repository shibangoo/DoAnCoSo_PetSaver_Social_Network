import Navbar from "./Navbar";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";

export default function Layout({ children }) {
  return (
    <div className="bg-[#f0f2f5] min-h-screen">

      <Navbar />

      <div className="flex max-w-7xl mx-auto mt-4 px-4">

        {/* LEFT */}
        <div className="w-1/4 hidden lg:block">
          <SidebarLeft />
        </div>

        {/* CENTER */}
        <div className="w-full lg:w-2/4 px-4">
          {children}
        </div>

        {/* RIGHT */}
        <div className="w-1/4 hidden xl:block">
          <SidebarRight />
        </div>

      </div>
    </div>
  );
}