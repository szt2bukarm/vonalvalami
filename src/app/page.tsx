"use client"
import React from "react"
import { Canvas } from "@react-three/fiber"
import Shader1 from "./Shader1"

export default function Home() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", display: "block",backgroundColor: "#eae9dc" }}
      orthographic
      camera={{ zoom: 1, position: [0, 0, 5] }}
    >
      <Shader1 />
    </Canvas>
  )
}
