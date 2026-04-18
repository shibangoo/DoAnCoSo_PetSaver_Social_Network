"use client";

import { useEffect, useState } from "react";
import API from "@/services/api.js";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    API.get("/users/me").then((res) => setUser(res.data));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-5">
      <h2 className="text-xl font-bold">{user.name}</h2>
    </div>
  );
}