import Layout from "../components/layout/Layout";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";

export default function Home() {
  const posts = [
    {
      author: { name: "Hoàng" },
      content: "Hôm nay bé cún rất dễ thương 🐶",
    },
  ];

  return (
    <Layout>

      <CreatePost />

      {posts.map((post, i) => (
        <PostCard key={i} post={post} />
      ))}

    </Layout>
  );
}