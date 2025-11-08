import StarFields from './components/StarFields'
import './App.css'

export default function App() {
  return (
    <main className="w-screen h-screen relative">
      {/* Background */}
      <StarFields />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-black/55 border border-white/12 rounded-xl p-5 w-[min(92vw,760px)] shadow-2xl backdrop-blur-md">
          <h1 className="text-white text-2xl font-bold select-none">AI Chat</h1>
          {/* <Chat /> */}
        </div>
      </div>
    </main>
  )
}
