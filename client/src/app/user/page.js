"use client";
import Header from "@/components/header/Header";
import React from "react";
import { useRouter } from "next/navigation";

const Users = () => {
  const router = useRouter();
  const { pathname } = router;
  return (
    <div>
      <Header />
      <h1>Users</h1>
      <p>These are the users in the page</p>
    </div>
  );
};

export default Users;
