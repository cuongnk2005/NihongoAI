import { useState, useCallback } from 'react';
import { api } from '../../../services/apiConfig';

export interface KaiwaMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  correctionVi?: string;
  timestamp: string;
}

export interface UseKaiwaChatReturn {
  level: string;
  setLevel: (level: string) => void;
  messages: KaiwaMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  resetConversation: () => void;
  playSpeech: (text: string) => void;
}

export const useKaiwaChat = (initialLevel: string = 'N4'): UseKaiwaChatReturn => {
  const [level, setLevel] = useState<string>(initialLevel);
  const [messages, setMessages] = useState<KaiwaMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'こんにちは！今日はどんな一日でしたか。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsgText = inputMessage.trim();
    const userMsg: KaiwaMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.sendKaiwaMessage(userMsgText, level);
      const aiMsg: KaiwaMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.aiReply,
        correctionVi: res.correctionVi,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, level]);

  const resetConversation = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'こんにちは！今日はどんな一日でしたか。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const playSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    level,
    setLevel,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sendMessage,
    resetConversation,
    playSpeech,
  };
};
