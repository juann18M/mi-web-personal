'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ iniciar vacío (FIX HYDRATION)
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ===============================
     ✅ MENSAJE INICIAL SOLO CLIENTE
  =============================== */
  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        text:
          '¡Hola! Soy el asistente virtual de BLACKS. ¿En qué puedo ayudarte?\n\n' +
          '• Dirección de sucursales\n' +
          '• Horarios de atención\n' +
          '• Políticas de envío y devoluciones\n' +
          '• Productos y tallas\n' +
          '• Formas de pago\n' +
          '• Y más...',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  /* ===============================
     AUTO SCROLL
  =============================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ===============================
     FOCUS INPUT
  =============================== */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  /* ===============================
     ENVIAR MENSAJE
  =============================== */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: 'Lo siento, tuve un problema. Intenta nuevamente.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     RESPUESTAS RÁPIDAS
  =============================== */
  const quickReplies = [
    '📍 ¿Dónde están ubicados?',
    '⏰ Horarios de atención',
    '🚚 Políticas de envío',
    '💳 Métodos de pago',
  ];

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageSquare size={24} />
      </button>

      {/* CHAT */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-3xl border border-gray-100 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{ height: '500px' }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 bg-black text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <div>
              <h3 className="font-bold text-sm">Asistente BLACKS</h3>
              <p className="text-[10px] opacity-70">
                IA • Respondo en segundos
              </p>
            </div>
          </div>

          <button onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* MENSAJES */}
        <div className="p-4 overflow-y-auto h-[380px]">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.text}
                  </p>

                  {/* ✅ YA NO ROMPE HYDRATION */}
                  <p className="text-[8px] mt-1 text-gray-500">
                    {message.timestamp.toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="bg-gray-100 p-3 rounded-2xl w-fit">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* QUICK REPLIES */}
        <div className="px-4 py-2 border-t">
          <div className="flex gap-2 overflow-x-auto">
            {quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => {
                  setInputMessage(reply);
                  inputRef.current?.focus();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-xs py-1.5 px-3 rounded-full"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-black"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-black text-white p-2 rounded-full disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}