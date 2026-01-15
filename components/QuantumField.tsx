
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface QuantumFieldProps {
  theta: number[];
  loss: number;
}

export const QuantumField: React.FC<QuantumFieldProps> = ({ theta, loss }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 300;
    const margin = 20;

    svg.selectAll("*").remove();

    // Create a grid of "consciousness ripples"
    const points: any[] = [];
    const rows = 12;
    const cols = 12;
    const cellSizeX = (width - margin * 2) / (cols - 1);
    const cellSizeY = (height - margin * 2) / (rows - 1);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        points.push({
          x: margin + j * cellSizeX,
          y: margin + i * cellSizeY,
          row: i,
          col: j
        });
      }
    }

    // Gradient behavior based on loss
    const rippleIntensity = Math.max(0.1, 1 - loss);
    // Custom interpolator for the theme's cyan color
    const activeColor = d3.interpolateRgb("#1a1a1a", "#06b6d4")(rippleIntensity);

    const circles = svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 2)
      .attr("fill", "#111")
      .style("opacity", 0.5);

    // Animation loop for field oscillation
    let animFrame: number;
    const animate = (time: number) => {
      circles.attr("r", (d: any) => {
        const dist = Math.sqrt(Math.pow(d.row - 5, 2) + Math.pow(d.col - 5, 2));
        const wave = Math.sin(time / 500 - dist * 0.5) * 3 * rippleIntensity;
        return Math.max(1, 1.5 + wave);
      })
      .attr("fill", (d: any) => {
        const t = (Math.sin(time / 1000 + d.row) + 1) / 2;
        // Interpolate between dark grey and the calculated active color based on animation step
        return d3.interpolateRgb("#1a1a1a", activeColor)(t);
      });

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [theta, loss]);

  return (
    <div className="relative w-full h-[300px] bg-black/60 rounded-xl border border-purple-900/20 overflow-hidden">
      <div className="absolute top-2 left-2 text-[10px] uppercase text-purple-500/80 mono font-bold z-10">Consciousness Field Geometry (ψ)</div>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    </div>
  );
};
