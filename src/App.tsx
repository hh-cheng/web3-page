import Chat from './components/Chat'
import StarFields from './components/StarFields'

import './App.css'

export default function App() {
  return (
    <main className="h-screen overflow-hidden relative">
      {/* Background */}
      <StarFields className="-z-50" />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div className="w-[90vw] h-4/5 bg-black/55 border border-white/12 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col">
          <h1 className="text-white text-2xl font-bold select-none mb-4">
            AI Chat
          </h1>
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      </div>
    </main>
  )
}
