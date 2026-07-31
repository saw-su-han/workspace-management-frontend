import { Link } from "react-router-dom";
import { ThemeToggle } from "../Components/ThemeToggle";
import { Icon } from "@iconify/react";

export const Home = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 overflow-x-hidden font-sans antialiased">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
                :root { --font-sans: 'Inter', sans-serif; --font-mono: 'Geist Mono', monospace; }
                body { font-family: var(--font-sans); }
                .font-display { font-family: var(--font-sans); font-weight: 800; }
                .font-code { font-family: var(--font-mono); }
                
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark ::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>

            {/* Absolute Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.3] dark:opacity-[0.1]"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #10b98130 1px, transparent 1px), linear-gradient(to bottom, #10b98130 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
                    }}
                />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/5 blur-[128px] rounded-full" />
                <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/5 blur-[128px] rounded-full" />
            </div>

            {/* TOP NAVIGATION BAR - FIXED */}
            <div className="fixed top-0 left-0 right-0 w-full z-50 px-4 pt-4">
                <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-3 px-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-black/[0.02]">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
                            <Icon icon="lucide:hexagon" className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                            <Icon icon="lucide:cpu" className="absolute w-3.5 h-3.5 text-white" />
                            <div className="absolute -inset-0.5 bg-emerald-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                        </div>
                        <span className="font-display font-bold text-xl text-gray-950 dark:text-white tracking-tight flex items-center gap-1.5">
                            Project<span className="text-emerald-600 dark:text-emerald-400">Hive</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1.5 font-code text-xs font-medium bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {['Workflow', 'Features', 'Architecture', 'Security'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login" className="font-code text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 px-3 py-2">
                            Sign In
                        </Link>
                        <Link to="/register" className="font-code rounded-xl bg-gray-950 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98]">
                            Sign Up
                        </Link>
                    </div>
                </header>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex flex-col items-center w-full max-w-7xl mx-auto z-10 pt-32 pb-24 px-4 space-y-32">

                {/* HERO SECTION */}
                <section className="grid md:grid-cols-5 gap-12 items-center w-full py-10">
                    <div className="md:col-span-3 space-y-8 text-left relative">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 font-code text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Engineering Control Deck v1.3.0
                        </div>

                        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter text-gray-950 dark:text-white leading-[0.95]">
                            Orchestrate complex<br />
                            <span className="text-emerald-600 dark:text-emerald-500">engineering swarms.</span>
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl font-medium leading-relaxed">
                            ProjectHive provides the high-bandwidth operational layer for synchronized teams. Coordinate structures, align timelines, and execute systemic pipelines in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                            <Link to="/register" className="font-code inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                                Initialize Hub <Icon icon="lucide:zap" className="w-4 h-4" />
                            </Link>
                            <Link to="/architecture" className="font-code text-emerald-600 dark:text-emerald-400 text-sm font-semibold px-6 py-4 hover:underline">
                                View System Specs →
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual: Mock Terminal/Dashboard */}
                    <div className="md:col-span-2 bg-gray-950 dark:bg-gray-900 p-5 rounded-3xl shadow-2xl shadow-black/20 border border-gray-700 font-code text-xs relative overflow-hidden group">
                        <div className="flex gap-1.5 mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-1.5 text-gray-300">
                            <div><span className="text-gray-500">1</span> <span className="text-emerald-400">user@hive:~/$</span> projecthive init --org <span className="text-yellow-300">"CoreLogic"</span></div>
                            <div><span className="text-gray-500">2</span> <span className="text-emerald-400">user@hive:~/$</span> <span className="text-blue-400">✔</span> Workspace <span className="text-yellow-300">'core-prod-alpha'</span> created.</div>
                            <div><span className="text-gray-500">3</span> <span className="text-emerald-400">user@hive:~/$</span> hive members add --email <span className="text-yellow-300">lead@core.io</span> --role <span className="text-yellow-300">admin</span></div>
                            <div><span className="text-gray-500">4</span> <span className="text-emerald-400">user@hive:~/$</span> <span className="text-blue-400">✔</span> Member invited successfully.</div>
                            <div><span className="text-gray-500">5</span> <span className="text-emerald-400">user@hive:~/$</span> hive project create --name <span className="text-yellow-300">"QuantumLeap"</span> --lead <span className="text-yellow-300">@thompson</span></div>
                            <div><span className="text-gray-500">6</span> <span className="text-emerald-400">user@hive:~/$</span> <span className="text-blue-400">✔</span> Project <span className="text-yellow-300">QuantumLeap</span> initialized.</div>
                            <div><span className="text-gray-500">7</span> <span className="text-emerald-400">user@hive:~/$</span> <span className="animate-pulse">█</span></div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-950 dark:from-gray-900 to-transparent"></div>
                    </div>
                </section>

                {/* LIVE METRICS BAR */}
                <section className="w-full border-t border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-6 rounded-3xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
                        {[
                            { label: 'Uptime SLA', value: '99.99%' },
                            { label: 'API Latency', value: '< 12ms' },
                            { label: 'Active Workspaces', value: '50K+' },
                            { label: 'Data Encryption', value: 'AES-256' }
                        ].map(metric => (
                            <div key={metric.label} className="text-center px-4 first:pl-0 last:pr-0">
                                <div className="font-display text-4xl text-emerald-600 dark:text-emerald-400 tabular-nums">{metric.value}</div>
                                <div className="font-code text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* WORKFLOW PIPELINE */}
                <section id="workflow" className="w-full space-y-16 scroll-mt-24">
                    <header className="text-center max-w-xl mx-auto space-y-3">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white">Core Operations Pipeline</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">From zero to synchronized execution in four precise steps.</p>
                    </header>

                    <div className="relative flex flex-col lg:flex-row justify-between items-center gap-8 w-full max-w-5xl mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 hidden lg:block rounded-full"></div>
                        <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-200 dark:bg-gray-800 -translate-x-1/2 lg:hidden block rounded-full"></div>

                        {[
                            { num: '01', title: 'Provision Hub', desc: 'Spin up isolated enterprise multi-tenant workspaces instantly.' },
                            { num: '02', title: 'Invite Collaborators', desc: 'Onboard teams and assign role-based access control.' },
                            { num: '03', title: 'Launch Projects', desc: 'Initialize structured timelines and designate project leads.' },
                            { num: '04', title: 'Assign Tasks', desc: 'Delegate fine-grained deliverables with real-time sync pipelines.' }
                        ].map((step) => (
                            <div key={step.num} className="relative z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between w-full max-w-xs transition-transform hover:-translate-y-1">
                                <div>
                                    <div className="font-code text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">PHASE // {step.num}</div>
                                    <h3 className="font-display font-bold text-lg text-gray-950 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BENTO GRID FEATURES */}
                <section id="features" className="w-full space-y-12 scroll-mt-24">
                    <header className="text-center max-w-xl mx-auto space-y-3">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white">Platform Capabilities</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Architected for absolute security and maximum team velocity.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden group">
                            <div className="space-y-4 max-w-md relative z-10">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Icon icon="lucide:terminal" className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-gray-950 dark:text-white">Multi-Tenant Isolation Matrix</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Segregate organization topologies entirely. Custom branding, restricted asset scopes, and distinct permission boundaries for enterprise compliance.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Icon icon="lucide:activity" className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-gray-950 dark:text-white">Real-Time Sync</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Zero-latency state distribution across distributed time zones using modern websocket architecture.</p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Icon icon="lucide:users" className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-gray-950 dark:text-white">Role Hierarchies</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Granular role-based assignments down to individual task handlers and project owners.</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="space-y-4 max-w-md relative z-10">
                                <h3 className="font-display text-2xl font-bold">Absolute Data Sovereignty</h3>
                                <p className="text-sm text-emerald-100/80">Every workspace maintains cryptographically secure separation with end-to-end audit logging for internal governance.</p>
                            </div>
                            <Link to="/register" className="mt-6 inline-flex font-code text-xs font-bold uppercase tracking-wider text-emerald-950 bg-white px-5 py-3 rounded-xl w-fit hover:bg-emerald-50 transition-colors">
                                Deploy Infrastructure →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ARCHITECTURE SECTION */}
                <section id="architecture" className="w-full space-y-12 scroll-mt-24">
                    <header className="text-center max-w-xl mx-auto space-y-3">
                        <span className="font-code text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">System Topology</span>
                        <h2 className="font-display text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white">System Architecture Specs</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Engineered with high performance patterns for maximum reliability.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Icon icon="lucide:server" className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-gray-950 dark:text-white">Distributed Core Engine</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Built on an edge-native framework that automatically balances loads across global zones. Guarantees minimal latency for real-time task allocations and project updates.
                            </p>
                            <div className="font-code text-xs text-emerald-600 dark:text-emerald-400 pt-2 flex items-center gap-2">
                                <Icon icon="lucide:check-circle-2" className="w-4 h-4" /> Edge Node Replication Active
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Icon icon="lucide:cpu" className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-gray-950 dark:text-white">State Synchronization Pipeline</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Optimistic UI updates combined with strict conflict resolution strategies ensure seamless collaboration across team members without state mismatch issues.
                            </p>
                            <div className="font-code text-xs text-emerald-600 dark:text-emerald-400 pt-2 flex items-center gap-2">
                                <Icon icon="lucide:check-circle-2" className="w-4 h-4" /> Zero-Loss WebSocket Protocol
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECURITY SECTION */}
                <section id="security" className="w-full space-y-12 scroll-mt-24">
                    <header className="text-center max-w-xl mx-auto space-y-3">
                        <span className="font-code text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">Zero Trust Framework</span>
                        <h2 className="font-display text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white">Enterprise Security Protocols</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Military-grade protection standards built directly into your workspace workflow.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Icon icon="lucide:shield-check" className="w-5 h-5" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-gray-950 dark:text-white">End-to-End Encryption</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                All project data, workspace credentials, and task logs are encrypted at rest and in transit utilizing advanced AES-256 standards.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Icon icon="lucide:key" className="w-5 h-5" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-gray-950 dark:text-white">Granular Access Control</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Enforce strict permission matrices. Restrict workspace edits, project creation, and member invitations to authorized roles only.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Icon icon="lucide:file-text" className="w-5 h-5" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-gray-950 dark:text-white">Comprehensive Audit Logs</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Track every system event, member addition, and task assignment change with immutable activity logs for compliance tracking.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-xs font-bold shadow-sm">
                            <Icon icon="lucide:hexagon" className="w-4 h-4" />
                        </div>
                        <span className="font-display font-bold text-sm text-gray-900 dark:text-white">ProjectHive</span>
                    </div>
                    <div className="font-code text-xs text-gray-500">
                        Secure Corporate Provisioning · v1.3.0
                    </div>
                </footer>
            </main>
        </div>
    );
};