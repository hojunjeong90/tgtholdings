'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Edge {
  from: number;
  to: number;
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 리사이즈 처리 및 노드 초기화
  useEffect(() => {
    const initNodes = (width: number, height: number) => {
      const nodeCount = Math.floor((width * height) / 40000);
      const nodes: Node[] = [];

      for (let i = 0; i < Math.min(nodeCount, 50); i++) {
        nodes.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
        });
      }

      nodesRef.current = nodes;

      const edges: Edge[] = [];
      const maxDistance = Math.min(width, height) * 0.2;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && Math.random() > 0.7) {
            edges.push({ from: i, to: j });
          }
        }
      }

      edgesRef.current = edges;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      initNodes(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 애니메이션 시작/정지
  useEffect(() => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 화면 지우기
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // 노드 위치 업데이트
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // 경계 처리 (부드럽게 반사)
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // 경계 내로 유지
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      });

      // 엣지 그리기
      const isDark = document.documentElement.classList.contains('dark');
      const nodeColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';

      ctx.lineWidth = 1;

      edges.forEach((edge) => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];

        if (fromNode && toNode) {
          const dx = fromNode.x - toNode.x;
          const dy = fromNode.y - toNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = Math.min(width, height) * 0.25;

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${0.08 * opacity})`
              : `rgba(0, 0, 0, ${0.06 * opacity})`;

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          }
        }
      });

      // 노드 그리기
      ctx.fillStyle = nodeColor;
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
