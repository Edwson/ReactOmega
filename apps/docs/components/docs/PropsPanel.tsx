'use client';

import { cn } from '@/lib/utils';

export interface PropConfig {
    name: string;
    type: 'number' | 'boolean' | 'color' | 'select' | 'range' | 'string';
    default: any;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: string }[];
    description?: string;
}

interface PropsPanelProps {
    config: PropConfig[];
    values: Record<string, any>;
    onChange: (values: Record<string, any>) => void;
    className?: string;
}

export function PropsPanel({ config, values, onChange, className }: PropsPanelProps) {
    const handleChange = (name: string, value: any) => {
        onChange({ ...values, [name]: value });
    };

    return (
        <div className={cn("rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6", className)}>
            <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Properties</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                {config.map((prop) => (
                    <div key={prop.name} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white/90 font-mono">{prop.name}</label>
                            <span className="text-xs text-white/50 font-mono">
                                {String(values[prop.name])}
                            </span>
                        </div>

                        {prop.type === 'number' && (
                            <input
                                type="number"
                                value={values[prop.name]}
                                onChange={(e) => handleChange(prop.name, Number(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                        )}

                        {prop.type === 'range' && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={prop.min}
                                    max={prop.max}
                                    step={prop.step}
                                    value={values[prop.name]}
                                    onChange={(e) => handleChange(prop.name, Number(e.target.value))}
                                    className="flex-1 accent-white"
                                />
                            </div>
                        )}

                        {prop.type === 'boolean' && (
                            <button
                                onClick={() => handleChange(prop.name, !values[prop.name])}
                                className={cn(
                                    "w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out",
                                    values[prop.name] ? "bg-white" : "bg-white/20"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform duration-200 ease-in-out",
                                        values[prop.name] ? "translate-x-4" : "translate-x-0"
                                    )}
                                />
                            </button>
                        )}

                        {prop.type === 'color' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={values[prop.name]}
                                    onChange={(e) => handleChange(prop.name, e.target.value)}
                                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={values[prop.name]}
                                    onChange={(e) => handleChange(prop.name, e.target.value)}
                                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                                />
                            </div>
                        )}

                        {prop.type === 'select' && (
                            <select
                                value={values[prop.name]}
                                onChange={(e) => handleChange(prop.name, e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                            >
                                {prop.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}

                        {prop.type === 'string' && (
                            <input
                                type="text"
                                value={values[prop.name]}
                                onChange={(e) => handleChange(prop.name, e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                        )}

                        {prop.description && (
                            <p className="text-xs text-white/40">{prop.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
