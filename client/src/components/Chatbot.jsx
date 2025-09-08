"use client"

import { useState, useRef, useEffect } from "react"
import { franc } from "franc"
import { Send, MessageCircle, X } from "lucide-react"

const CHAT_STORAGE_KEY = "chatbot_messages"
const EXPIRATION_MS = 5 * 60 * 1000 // 5 minutos

const Chatbot = () => {
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 ¡Hola! ¿En qué podemos ayudarte hoy?",
      options: ["Ver productos", "Productos sugeridos", "¿Cómo realizar un reembolso?"],
    },
  ])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Guardar en localStorage cada vez que cambien los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    try {
      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: messages })
      )
    } catch (e) {
      console.error("Error guardando mensajes en localStorage:", e)
    }
  }, [messages])

  // Configurar limpieza automática después de 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Date.now() - parsed.timestamp >= EXPIRATION_MS) {
            localStorage.removeItem(CHAT_STORAGE_KEY)
            setMessages([
              {
                from: "bot",
                text: "👋 ¡Hola! ¿En qué podemos ayudarte hoy?",
                options: ["Ver productos", "Productos sugeridos", "¿Cómo realizar un reembolso?"],
              },
            ])
          }
        }
      } catch (e) {
        console.error("Error limpiando mensajes:", e)
      }
    }, 10000) // revisa cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [loading, isOpen])

  const farewellKeywords = ["gracias", "ok", "vale", "adiós", "chau"]
  const isFarewell = (text) => farewellKeywords.some((word) => text.toLowerCase().includes(word))

  const detectLanguage = (text) => {
    const langCode = franc(text)
    if (langCode === "spa") return "es"
    if (langCode === "eng") return "en"
    return "es"
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const userText = text.trim()
    setMessages((prev) => [...prev, { from: "user", text: userText }])
    setLoading(true)
    setInput("")

    if (isFarewell(userText)) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "✅ ¡Gracias por visitarnos! Si necesitas más ayuda, aquí estaré." },
      ])
      setLoading(false)
      return
    }

    switch (userText.toLowerCase()) {
      case "ver productos":
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "🛍️ Puedes ver todos nuestros productos destacados en la sección de categorías o buscar lo que necesites. ¿Deseas ver alguna categoría específica?",
          },
        ])
        break
      case "productos sugeridos":
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "🎯 Te recomendamos:\n- Ventana corredera\n- Puerta abatible\n- Vidrio templado\n¿Quieres más detalles de alguno?",
          },
        ])
        break
      case "¿cómo realizar un reembolso?":
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `💸 Para solicitar un reembolso debes contactar directamente al administrador.<br/><br/>
📞 WhatsApp: <a href="https://web.whatsapp.com/send?phone=51901670452&text=Hola%20quiero%20solicitar%20un%20reembolso" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; text-decoration: underline;">901670452</a><br/><br/>
✅ Te atenderán lo antes posible.`,
            isHtml: true,
          },
        ])
        break
      default:
        try {
          const language = detectLanguage(userText)

          const res = await fetch("http://localhost:3002/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText, language }),
          })

          const data = await res.json()
          setMessages((prev) => [...prev, { from: "bot", text: data.reply }])
        } catch {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "❌ Lo siento, hubo un error al procesar tu mensaje." },
          ])
        }
        break
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleOptionClick = (option) => sendMessage(option)

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:scale-110" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🧠</div>
                <div>
                  <h3 className="font-semibold text-sm">Asistente Virtual</h3>
                  <p className="text-xs text-green-100">Multiservicios</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md shadow-sm"
                  }`}
                  {...(msg.isHtml
                    ? { dangerouslySetInnerHTML: { __html: msg.text } }
                    : { children: msg.text })}
                />
                {msg.options && (
                  <div className="mt-3 space-y-2 w-full max-w-[85%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        className="w-full text-left bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
                <span>Escribiendo...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 max-h-32"
                  style={{
                    height: "auto",
                    minHeight: "44px",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
