import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/llwu/social-crowdfund-dapp" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Tribute"
        subTitle="Social crowdfunding DApp"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
