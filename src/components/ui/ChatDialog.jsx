import { useEffect, useRef, useState } from 'react'

export default function ChatDialog({ open, onClose, sellerName }){
  const [messages, setMessages] = useState([{ id:1, from:'seller', text:'Hi! Yes it\'s available.' }])
  const [text, setText] = useState('')
  const endRef = useRef(null)
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, open])
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-4 py-3 border-b font-medium">Chat with {sellerName}</div>
        <div className="h-72 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map(m => (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${m.from==='me' ? 'ml-auto bg-gray-900 text-white' : 'bg-white border'}`}>{m.text}</div>
          ))}
          <div ref={endRef}/>
        </div>
        <div className="p-3 border-t flex gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()} className="border rounded px-3 py-2 flex-1" placeholder="Type a message..."/>
          <button onClick={send} className="bg-gray-900 text-white px-3 py-2 rounded">Send</button>
        </div>
      </div>
    </div>
  )
  function send(){ if(!text.trim()) return; setMessages(m=>[...m, {id:Date.now(), from:'me', text}]); setText('') }
}
