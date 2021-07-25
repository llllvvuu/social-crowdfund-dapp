import React from "react";

import NFTSmall from "./NFTSmall";

interface NFTLargeProps {
  style?: React.CSSProperties;
  rank: number;
  address: string;
}

const NFTLarge: React.FunctionComponent<NFTLargeProps> = (props) => {
  const { style, rank, address } = props;
  return <NFTSmall rank={rank} address={address} style={{ ...style, width: 472, height: 472 }} />
}

export default NFTLarge;
