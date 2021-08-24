import React from "react";

export function clip(number, maximum, minimum) {
  return(
    number >= maximum
    ? maximum 
    : number <= minimum 
      ? minimum
      : number
  )
}

export function Texto(x, y, content) {
  return(
    <text 
      x={x + 0.5} 
      y={y - 0.5}
      style={{fontSize:"1px"}} >
      {
        content
      }
    </text>
  );
}

export function Line(x1, y1, x2, y2) {
  return(
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
    </g>
  )
}

export function Cross(x, y, size) {
  return(
    <g>
      {Line(x - size, y, x + size, y)}
      {Line(x, y - size, x, y + size)}
    </g>
  );
}

export function Circle(x, y, r) {
  return(
    <path 
    d={`
    M ${x} ${y}
    m ${-r}, 0
    a ${r},${r} 0 1,1 ${(r * 2)},0
    a ${r},${r} 0 1,1 ${-(r * 2)},0
    `}
/>
    // <circle 
    //   cx={x}
    //   cy={y}
    //   r={size}
    //   style={{fillOpacity:1}} >
    //   <animate 
    //     attributeName="r" 
    //     values={`${size * 0.9};${size * 1.1};${size * 0.9}`}
    //     dur="2s" 
    //     repeatCount="indefinite" />
    // </circle>
  );
}

export function Rect(x, y, size) {
  return(
    <rect x={x-size/2} y={y-size/2} width={size} height={size} rx={0.1}/>
  );
}

export const Shapes = {
  "rect" : Rect,
  "cross" : Cross,
  "circle" : Circle
}

export default function Shape(coords, options) {

  const x = clip(coords.x * options.width, options.width, 0);
  const y = clip(coords.y * options.height, options.height, 0);

  return(
    <g 
      key={options.id+options.text}
      fill="none"
      // fill={options.color}
      stroke={options.strokeColor}
      strokeWidth={options.strokeWidth} >
      {
      options.text
      ? Texto(x + 1.2, y + 0.7, options.text)
      : null
      }
      {Shapes[options.shape](x, y, options.size)}
    </g>
  );
}