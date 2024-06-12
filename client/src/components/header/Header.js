"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Flex } from "antd";

const DefaultButtons = ({ currentRoute }) => {
  const router = useRouter();
  switch (currentRoute) {
    case "/about":
      return (
        <Flex gap="small" wrap>
          <Button onClick={() => router.push("/")}>Main Shopping List</Button>
          <Button type="primary" onClick={() => router.push("/about")}>
            About
          </Button>
          <Button onClick={() => router.push("/user")}>Users</Button>
        </Flex>
      );
    case "/user":
      return (
        <Flex gap="small" wrap>
          <Button onClick={() => router.push("/")}>Main Shopping List</Button>
          <Button onClick={() => router.push("/about")}>About</Button>
          <Button type="primary" onClick={() => router.push("/user")}>
            Users
          </Button>
        </Flex>
      );
    default:
      return (
        <Flex gap="small" wrap>
          <Button type="primary" onClick={() => router.push("/")}>
            Main Shopping List
          </Button>
          <Button onClick={() => router.push("/about")}>About</Button>
          <Button onClick={() => router.push("/user")}>Users</Button>
        </Flex>
      );
  }
};

const Header = () => {
  const pathname = usePathname();
  return <DefaultButtons currentRoute={pathname} />;
};

export default Header;
