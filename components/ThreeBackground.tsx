import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Defining intrinsic elements to resolve JSX type issues in the local environment
const Group = 'group' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const SpotLight = 'spotLight' as any;

const FloatingShapes = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.cos(t / 4) / 8, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t / 8) / 8, 0.05);
    }
  });

  return (
    <Group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1.2, 64, 64]} position={[-6, 3, -4]}>
          <MeshDistortMaterial color="#E6E6FA" speed={3} distort={0.4} roughness={0.1} metalness={0.2} />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={2}>
        <Sphere args={[2, 64, 64]} position={[7, -2, -10]}>
          <MeshDistortMaterial color="#FFDAB9" speed={2} distort={0.3} roughness={0.1} />
        </Sphere>
      </Float>
      <Float speed={3} rotationIntensity={1} floatIntensity={1.5}>
        <Sphere args={[0.9, 64, 64]} position={[0, -6, -5]}>
          <MeshDistortMaterial color="#FFFDD0" speed={4} distort={0.5} roughness={0.1} />
        </Sphere>
      </Float>
    </Group>
  );
};

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#fdfaf7]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <AmbientLight intensity={0.6} />
        <PointLight position={[20, 30, 10]} intensity={1.5} />
        <SpotLight position={[-20, 30, 10]} angle={0.2} penumbra={1} intensity={1} />
        <FloatingShapes />
        <ContactShadows opacity={0.4} scale={20} blur={2.4} far={20} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;