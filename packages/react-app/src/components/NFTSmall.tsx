import React from "react";

var randomColor = require('randomcolor');

const OUTER_CIRCLE: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: 20,
  height: 20,
  backgroundColor: "#000000",
  borderRadius: "50%",
}

const INNER_CIRCLE: React.CSSProperties = {
  marginTop: "25%",
  marginLeft: "25%",
  position: "absolute",
  width: "50%",
  height: "50%",
  backgroundColor: "#e5e5e5",
  borderRadius: "50%",
}

const outerCircle = (rank: number) => {
  if (rank === 0) {
    return { ...OUTER_CIRCLE, backgroundColor: "#FFD700" };
  } else if (rank === 1) {
    return { ...OUTER_CIRCLE, backgroundColor: "#c0c0c0" };
  } else if (rank === 2) {
    return { ...OUTER_CIRCLE, backgroundColor: "#CD7F32" };
  } else {
    return { ...OUTER_CIRCLE, backgroundColor: "transparent" };
  }
}

const innerCircle = (address: string) => {
  return { ...INNER_CIRCLE, backgroundColor: randomColor({ seed: address.toLowerCase() }) };
}

interface NFTSmallProps {
  style?: React.CSSProperties;
  rank: number;
  address: string;
}

const NFTSmall: React.FunctionComponent<NFTSmallProps> = (props) => {
  const { style, rank, address } = props;
  return (
    <div style={{ ...outerCircle(rank), ...style }}>
      <div style={innerCircle(address)} />
    </div>
  );
}

export default NFTSmall;
