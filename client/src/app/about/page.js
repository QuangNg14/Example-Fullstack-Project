"use client";
import Header from "@/components/header/Header";
import React from "react";
import { useRouter } from "next/navigation";

const About = () => {
  const router = useRouter();
  const { pathname } = router;
  return (
    <div>
      <Header />
      <h1>About</h1>
      <p>This is a simple shopping list application.</p>
    </div>
  );
};

export default About;
