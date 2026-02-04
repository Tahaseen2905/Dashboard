import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, BarChart2, Key, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { geminiService } from '../services/GeminiService';

interface ChatbotProps {
    data: any[];
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    type?: 'text' | 'analysis' | 'sentiment';
    chartData?: any;
    isError?: boolean;
}

export default function DashboardChatbot({ data }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envKey && envKey.length > 10) {
            setApiKey(envKey);
            try {
                geminiService.initialize(envKey);
                setIsConfigured(true);
            } catch (e) {
                console.error("Auto-init failed", e);
            }
        }
    }, []);

    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi! I'm your AI Talent Analyst. I can answer complex questions about your data.", sender: 'bot' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const prepareDataContext = () => {
        if (data.length === 0) return "No data available.";

        // Fields to exclude to save tokens as per user request
        const excludedFields = [
            'HRBP Name', 'aadhaar', 'assignmentRating',
            'dreamProject', 'feedback',
            'hiringManagerEmail', 'hiringManagerName', 'j2wEmail',
            'j2wId', 'j2wRating', 'nativePlace', 'opportunities',
            'recentAssignments', 'reportingManagerEmail',
        ];

        // 1. Get headers from the first object, filtering out excluded ones
        const headers = Object.keys(data[0]).filter(h => !excludedFields.includes(h));

        // 2. Create Csv Header Row
        const headerRow = headers.join(',');

        // 3. Map rows
        const rows = data.map(row => {
            return headers.map(fieldName => {
                const val = (row as any)[fieldName];
                // Escape commas/quotes if necessary
                const str = String(val ?? '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        // 4. Combine
        const csvString = [headerRow, ...rows].join('\n');

        return `
        Dataset Description: Candidate data (CSV).
        Columns: ${headers.join(', ')}
        Total Records: ${data.length}
        
        CSV DATA:
        ${csvString}
        `;
    };

    const handleConfigSubmit = () => {
        if (apiKey.trim().length > 10) {
            try {
                geminiService.initialize(apiKey);
                setIsConfigured(true);
            } catch (e) {
                alert("Invalid API Key format");
            }
        }
    };

    const [cooldown, setCooldown] = useState(0);

    // Countdown timer for rate limiting
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleSend = async () => {
        if (!input.trim() || cooldown > 0) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const context = prepareDataContext();
            const response = await geminiService.analyzeWithGemini(context, input);

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                type: response.type,
                chartData: response.chartData
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            console.error("Gemini Error:", error);
            let errorMessage = "Sorry, I encountered an error. Please check your connection.";
            let delay = 0;

            // Check for Rate Limit (429)
            if (error.message?.includes('429') || error.status === 429 || error.message?.includes('Quota exceeded')) {
                // Try to extract retry time "Please retry in X s"
                const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
                delay = match ? Math.ceil(parseFloat(match[1])) : 60; // Default to 60s if parsing fails
                errorMessage = `Running hot! Recharging AI capacity. Available in ${delay}s...`;
                setCooldown(delay);
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: errorMessage,
                sender: 'bot',
                isError: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9000, fontFamily: "'Inter', sans-serif" }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '550px',
                    height: '700px',
                    background: 'var(--card-bg, #ffffff)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--card-border, #e2e8f0)',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Talent Assistant</h3>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                                    {isConfigured ? 'Online' : 'Setup Required'}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {!isConfigured ? (
                        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: '#0284c7' }}>
                                <Key size={32} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Setup AI Access</h3>
                            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                                Please enter your Google Gemini API Key to enable intelligent analysis.
                            </p>
                            <input
                                type="password"
                                placeholder="Paste API Key here..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={handleConfigSubmit}
                                disabled={apiKey.length < 10}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: apiKey.length >= 10 ? '#3b82f6' : '#cbd5e1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: apiKey.length >= 10 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Connect Gemini AI
                            </button>
                            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Your key is used locally and never stored on our servers.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'var(--bg-gradient)' }}>
                                {messages.map((msg) => (
                                    <div key={msg.id} style={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '1rem',
                                            borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' : (msg.isError ? '#fee2e2' : 'var(--input-bg, white)'),
                                            color: msg.sender === 'user' ? 'white' : (msg.isError ? '#dc2626' : 'var(--text-color, #1e293b)'),
                                            boxShadow: msg.sender === 'bot' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : '0 4px 10px rgba(59, 130, 246, 0.3)',
                                            border: msg.sender === 'bot' ? '1px solid var(--card-border)' : 'none'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                                            {/* Sentiment Chart Rendering */}
                                            {msg.type === 'sentiment' && msg.chartData && (
                                                <div style={{ marginTop: '1rem', height: '150px', width: '100%', minWidth: '250px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                                        <BarChart2 size={14} /> SENTIMENT SCORE
                                                    </div>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={msg.chartData}>
                                                            <defs>
                                                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="name" hide />
                                                            <Tooltip
                                                                contentStyle={{ background: 'var(--card-bg)', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                            />
                                                            <Area type="monotone" dataKey="sentiment" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPv)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '20px 20px 20px 4px',
                                            background: 'var(--input-bg, white)',
                                            border: '1px solid var(--card-border)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            color: '#64748b', fontSize: '0.85rem'
                                        }}>
                                            <Loader2 size={16} className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(100,116,139,0.2)', borderTopColor: '#64748b' }} />
                                            Analyzing data...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={{
                                padding: '1rem',
                                background: 'var(--card-bg, white)',
                                borderTop: '1px solid var(--card-border, #e2e8f0)',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : "Ask about candidates, clients..."}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        borderRadius: '999px',
                                        border: '1px solid var(--input-border, #cbd5e1)',
                                        background: 'var(--input-bg, #f8fafc)',
                                        color: 'var(--input-text, #1e293b)',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        opacity: cooldown > 0 ? 0.6 : 1
                                    }}
                                    disabled={isTyping || cooldown > 0}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isTyping || !input.trim() || cooldown > 0}
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '50%',
                                        background: isTyping || cooldown > 0 ? '#94a3b8' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        cursor: isTyping || cooldown > 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            <style>
                {`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                `}
            </style>
        </div>
    );
}
