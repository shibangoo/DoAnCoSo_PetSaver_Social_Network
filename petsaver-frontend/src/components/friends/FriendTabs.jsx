export default function FriendTabs({ tab, setTab }) {
  const tabs = ["requests", "friends", "suggestions"];

  return (
    <div className="flex gap-3 mb-4">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-4 py-2 rounded-full text-sm capitalize transition
            ${
              tab === t
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-orange-100"
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}