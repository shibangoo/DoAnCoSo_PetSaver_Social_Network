import Navbar from "./components/layout/Navbar";
import CreatePost from "./components/post/CreatePost";
import PostCard from "./components/post/PostCard";

function App() {
  const posts = [
    {
      author: { name: "Hoàng" },
      content: "Hôm nay bé cún rất dễ thương 🐶",
    },
  ];

  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto py-6">
        <CreatePost />

        {posts.map((post, i) => (
          <PostCard key={i} post={post} />
        ))}
      </div>
    </div>
  );
}

export default App;