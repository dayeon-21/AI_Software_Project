import io from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

// --- [3D 컴포넌트] 로봇 모델 ---
const RobotModel = ({ position, action }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    // 상태에 따른 애니메이션 (간단한 떨림/이동)
    if (action === 'Walking') {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime) * 2;
    } else if (action === 'Cleaning') {
      meshRef.current.rotation.y += 0.1; // 회전
    } else {
      meshRef.current.position.x = 0;
      meshRef.current.rotation.y = 0;
    }
  });

  // 상태별 색상
  const color = action === 'Cleaning' ? '#4ade80' : (action === 'Walking' ? '#60a5fa' : '#9ca3af');

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
      <Text position={[0, 1.2, 0]} fontSize={0.5} color="white">
        {action}
      </Text>
    </mesh>
  );
};

// --- [메인 대시보드] ---
function App() {
  // 데이터 상태 (초기값)
  const [data, setData] = useState({
    vision: { label: 'Waiting...', conf: 0, matrix: [] },
    audio: { top3: [] },
    location: { livingProb: 50, kitchenProb: 50, x: 0 },
    gru: { action: 'Idle', probs: [] }
  });

  const [isLocked, setIsLocked] = useState(false);

  // --- 시뮬레이션 데이터 생성 (서버 연결 전 테스트용) ---
  useEffect(() => {
    // 1. 백엔드 서버 연결
    const socket = io("http://localhost:8000", { transports: ["websocket"] });

    // 2. 데이터 수신 대기
    socket.on("locus_data", (packet) => {
      // 받은 데이터로 화면 갱신
      const { vision, audio, location, gru } = packet;
      
      // GRU Locked 판별 로직
      const topAction = gru.probs.reduce((p, c) => (p.prob > c.prob) ? p : c);
      const locked = topAction.prob >= 0.7;
      
      setIsLocked(locked);
      setData({
        vision, audio, location,
        gru: { action: topAction.name, probs: gru.probs }
      });
    });

    return () => socket.disconnect();
  }, []);

  // --- 렌더링 ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans overflow-hidden">
      <header className="mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-blue-400 tracking-wider">LOCUS DASHBOARD</h1>
        <p className="text-sm text-gray-500">Learning On-device Context and User-specific Schedules</p>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[80vh]">
        
        {/* ZONE 1: SENSING (왼쪽 3칸) */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Vision Panel */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 mb-2">📷 Vision (YOLOv8)</h3>
            <div className="relative h-32 bg-black rounded mb-2 overflow-hidden flex items-center justify-center">
                <span className="text-gray-600 text-xs">Camera Feed</span>
                <div className={`absolute border-2 ${data.vision.conf > 0.8 ? 'border-green-500' : 'border-yellow-500'} p-1`} style={{top: '20%', left: '30%', width: '40%', height: '60%'}}>
                    <span className="bg-black/50 text-xs px-1">{data.vision.label} {(data.vision.conf * 100).toFixed(0)}%</span>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center text-xs">
                    <span className="w-12 text-right mr-2">Top-1</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${data.vision.conf * 100}%`}}></div>
                    </div>
                    <span className="ml-2 w-8">{ (data.vision.conf * 100).toFixed(0) }%</span>
                </div>
            </div>
          </div>

          {/* Audio Panel */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-1">
            <h3 className="text-sm font-bold text-gray-400 mb-2">🎙️ Audio (Yamnet)</h3>
            {/* Visualizer Fake */}
            <div className="flex items-end justify-between h-12 mb-4 gap-1">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-full bg-orange-500 transition-all duration-100" style={{height: `${Math.random() * 100}%`, opacity: 0.7}}></div>
                ))}
            </div>
            <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.audio.top3}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fill:'#9ca3af'}} />
                        <Bar dataKey="prob" fill="#f97316" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

           {/* Location Panel */}
           <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 mb-2">📍 Location (ARKit)</h3>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Living Room</span>
                <span>Kitchen</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full flex overflow-hidden mb-2">
                <div className="bg-green-500 transition-all duration-500" style={{width: `${data.location.livingProb}%`}}></div>
                <div className="bg-blue-500 flex-1"></div>
            </div>
          </div>
        </div>

        {/* ZONE 2: PROCESSING (중앙 5칸) */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Memory Stream */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-24">
             <h3 className="text-sm font-bold text-gray-400 mb-2">🧠 Memory Context (30 frames)</h3>
             <div className="flex gap-0.5 h-8">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="flex-1 bg-gray-700 transition-colors duration-300" 
                         style={{backgroundColor: `rgba(59, 130, 246, ${Math.random()})`}}></div>
                ))}
             </div>
          </div>

          {/* GRU Engine */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-green-400 mb-2">⚡ GRU Inference Engine</h3>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.gru.probs}>
                        <XAxis type="number" domain={[0, 1]} hide />
                        <YAxis dataKey="name" type="category" width={60} tick={{fill:'#ccc', fontSize:12}} />
                        <Bar dataKey="prob" barSize={25}>
                            {data.gru.probs.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.prob >= 0.7 ? '#4ade80' : '#4b5563'} />
                            ))}
                        </Bar>
                        <ReferenceLine x={0.7} stroke="red" strokeDasharray="3 3" />
                    </BarChart>
                </ResponsiveContainer>
                {/* Threshold Label */}
                <div className="absolute top-0 bottom-0 border-l border-dashed border-red-500 pointer-events-none" style={{left: '70%'}}>
                    <span className="text-red-500 text-xs absolute -top-4 -left-6">Threshold 0.7</span>
                </div>
            </div>

            {/* LOCKED STATUS BOX */}
            <div className={`mt-4 p-4 rounded text-center border-2 transition-all duration-300 ${isLocked ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'border-gray-600 bg-gray-900'}`}>
                <div className="text-xs text-gray-400 mb-1">DECISION STATUS</div>
                <div className={`text-2xl font-black tracking-widest ${isLocked ? 'text-green-400' : 'text-gray-500'}`}>
                    {isLocked ? `LOCKED: ${data.gru.action.toUpperCase()}` : 'ANALYZING...'}
                </div>
            </div>
          </div>
        </div>

        {/* ZONE 3: OUTPUT (오른쪽 4칸) */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Fusion Insight */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
             <h3 className="text-sm font-bold text-orange-400 mb-2">📊 Fusion Insight</h3>
             <div className="flex items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-full relative" 
                     style={{background: `conic-gradient(#f97316 0% 60%, #3b82f6 60% 90%, #22c55e 90% 100%)`}}>
                    <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-300 text-center">
                        Audio<br/>Dominant
                    </div>
                </div>
                <div className="text-xs space-y-1">
                    <div className="flex items-center"><div className="w-2 h-2 bg-orange-500 mr-2 rounded"></div> Audio: 60%</div>
                    <div className="flex items-center"><div className="w-2 h-2 bg-blue-500 mr-2 rounded"></div> Vision: 30%</div>
                    <div className="flex items-center"><div className="w-2 h-2 bg-green-500 mr-2 rounded"></div> Location: 10%</div>
                </div>
             </div>
          </div>

          {/* 3D Dashboard */}
          <div className="bg-black rounded-lg border border-gray-700 flex-1 relative overflow-hidden">
             <div className="absolute top-2 left-2 z-10 bg-black/50 px-2 py-1 rounded text-xs text-green-400 font-mono">
             &gt; SYSTEM STATE: {data.gru.action.toUpperCase()}  {/* ✅ 이렇게 변경 */}
             </div>
             <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <gridHelper args={[10, 10, 0x444444, 0x222222]} />
                <RobotModel position={[data.location.x, 0.5, 0]} action={data.gru.action} />
                <OrbitControls />
             </Canvas>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;