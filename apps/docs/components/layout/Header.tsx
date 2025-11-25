'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Github, Linkedin } from 'lucide-react';
import { MobileNav } from './MobileNav';

export function Header() {
    const pathname = usePathname();
    const isDocs = pathname?.startsWith('/docs');

    return (
        <header className="fixed top-0 left-0 right-0 z-[200] h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Ω</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        ReactΩ
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6">
                    <Link
                        href="/docs/backgrounds/hyperdrive"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-white",
                            isDocs ? "text-white" : "text-white/60"
                        )}
                    >
                        Documentation
                    </Link>
                    <Link
                        href="https://github.com/Edwson/ReactOmega"
                        target="_blank"
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <Github className="w-5 h-5" />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/ed-chen-saas/"
                        target="_blank"
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <Linkedin className="w-5 h-5" />
                    </Link>
                </nav>

                {/* Mobile Navigation Trigger */}
                <div className="lg:hidden">
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}
