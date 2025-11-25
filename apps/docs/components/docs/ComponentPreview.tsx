'use client';

import { useState, Suspense } from 'react';
import { PropsPanel, type PropConfig } from './PropsPanel';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps {
    component: React.ComponentType<any>;
    defaultProps: Record<string, any>;
    propsConfig: PropConfig[];
    className?: string;
}

export function ComponentPreview({
    component: Component,
    defaultProps,
    propsConfig,
    className,
}: ComponentPreviewProps) {
    const [props, setProps] = useState(defaultProps);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Live Preview */}
            <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                <Suspense fallback={<div className="flex items-center justify-center h-full text-white/50">Loading...</div>}>
                    <Component {...props} />
                </Suspense>
            </div>

            {/* Props Panel */}
            <PropsPanel
                config={propsConfig}
                values={props}
                onChange={setProps}
            />
        </div>
    );
}
