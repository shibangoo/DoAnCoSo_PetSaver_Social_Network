export default function Layout({ children }) {
  return (
    <div className="bg-[#f6f7fb] min-h-screen flex">

      {/* LEFT */}
      <div className="w-64 p-4">
        <SidebarLeft />
      </div>

      {/* CENTER */}
      <div className="flex-1 max-w-2xl mx-auto py-4">
        {children}
      </div>

      {/* RIGHT */}
      <div className="w-80 p-4">
        <SidebarRight />
      </div>

    </div>
  );
}