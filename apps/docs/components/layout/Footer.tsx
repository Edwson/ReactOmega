'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl mt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-white/60">
                        Made by{' '}
                        <a
                            href="https://edwson.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors font-semibold"
                        >
                            Ed Chen
                        </a>
                        {' '} | {' '}
                        <a
                            href="https://www.linkedin.com/in/ed-chen-saas/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            LinkedIn
                        </a>
                    </div>
                    <div className="text-sm text-white/40">
                        © 2026 ReactΩ. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
