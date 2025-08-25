import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function RotatingLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (textRef.current) {
      textRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Main 3D Shape */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#4f46e5"
          metalness={0.8}
          roughness={0.2}
          emissive="#1e1b4b"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Floating Text */}
      <Text
        ref={textRef}
        position={[0, -2, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        AI Assistant
      </Text>
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
    </group>
  );
}

interface ThreeDLogoProps {
  className?: string;
}

export default function ThreeDLogo({ className }: ThreeDLogoProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <RotatingLogo />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}