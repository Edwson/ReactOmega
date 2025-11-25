'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

interface CodeTabsProps {
    reactCode: string;
    jsCode: string;
    cssCode?: string;
}

export function CodeTabs({ reactCode, jsCode, cssCode }: CodeTabsProps) {
    const [activeTab, setActiveTab] = useState<'react' | 'html'>('react');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const codeToCopy = activeTab === 'react'
            ? reactCode
            : `${jsCode}\n\n/* CSS */\n${cssCode || ''}`;

        navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black/50 rounded-lg border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 border-b border-white/10 bg-white/5">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('react')}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'react' ? 'text-white' : 'text-white/60 hover:text-white'
                            }`}
                    >
                        React
                        {activeTab === 'react' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('html')}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'html' ? 'text-white' : 'text-white/60 hover:text-white'
                            }`}
                    >
                        HTML/JS/CSS
                        {activeTab === 'html' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                            />
                        )}
                    </button>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            <div className="p-4 overflow-x-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'react' ? (
                        <motion.div
                            key="react"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <pre className="font-mono text-sm text-white/80">
                                <code>{reactCode}</code>
                            </pre>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="html"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <div className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">JavaScript</div>
                                <pre className="font-mono text-sm text-white/80">
                                    <code>{jsCode}</code>
                                </pre>
                            </div>
                            {cssCode && (
                                <div>
                                    <div className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">CSS</div>
                                    <pre className="font-mono text-sm text-white/80">
                                        <code>{cssCode}</code>
                                    </pre>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
