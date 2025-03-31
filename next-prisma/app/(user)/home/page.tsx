import { Metadata } from "next";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const metadata: Metadata = {
    title: "Aubergine AI | Financial Fraud Detection System"
};

const Homepage = () => {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-500 text-white text-center py-24 relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        AI-Powered Financial Fraud Detection
                    </h1>
                    <p className="mt-2 text-xl md:text-2xl mb-8">
                        EXCEED THE EXPECTED with our next-gen digital solutions
                    </p>
                    <button className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all">
                        Request Demo
                    </button>
                </div>
            </section>

            {/* Carousel Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Multi-Agent Fraud Detection System
                    </h2>

                    <Carousel className="w-full">
                        <CarouselContent>
                            {[
                                {
                                    img: "/images/fraud-detection.jpg",
                                    title: "Real-time Transaction Monitoring",
                                    desc: "Our AI agents analyze thousands of transactions per second with sub-millisecond latency",
                                    features: ["Continuous monitoring", "Instant pattern recognition", "High-throughput processing"]
                                },
                                {
                                    img: "/images/ai-agents.jpg",
                                    title: "Collaborative AI Architecture",
                                    desc: "Specialized agents work in concert - transaction analyzers, regulation checkers, and pattern detectors",
                                    features: ["Modular agent design", "Distributed decision-making", "Dynamic workload balancing"]
                                },
                                {
                                    img: "/images/compliance.jpg",
                                    title: "Automated Regulatory Compliance",
                                    desc: "Built-in knowledge of global financial regulations that auto-updates with new policies",
                                    features: ["KYC/AML compliance", "Sanctions screening", "Audit trail generation"]
                                }
                            ].map((item, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col hover:-translate-y-1 transition-transform">
                                        <div className="h-64 relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src={item.img}
                                                alt={item.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-600 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 mb-4 flex-grow">{item.desc}</p>
                                        <ul className="space-y-2 mb-4">
                                            {item.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <span className="text-green-500 mr-2">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>

                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold mb-6">HackNUthon 6.0 AI Track Solution</h2>
                        <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                            This system was developed as our winning submission for HackNUthon 6.0,
                            addressing financial fraud detection through innovative multi-agent AI architecture.
                        </p>
                        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition">
                            View Case Study
                        </button>
                    </div>
                </div>
            </section>

            {/* Expertise Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Our AI Expertise
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                value: "11+",
                                title: "Years Experience",
                                desc: "Building enterprise AI solutions since 2013",
                                icon: "📅"
                            },
                            {
                                value: "400+",
                                title: "Products Deployed",
                                desc: "In financial institutions worldwide",
                                icon: "🚀"
                            },
                            {
                                value: "150+",
                                title: "Satisfied Clients",
                                desc: "Including top-tier banks and fintechs",
                                icon: "🏦"
                            },
                            {
                                value: "140+",
                                title: "AI Experts",
                                desc: "Global team of PhDs and engineers",
                                icon: "🧠"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-xl shadow-md border-t-4 border-green-400 text-center hover:-translate-y-1 transition-transform"
                            >
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <div className="text-5xl font-bold text-green-600 mb-2">{item.value}</div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        System Architecture
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="bg-gray-100 rounded-xl p-8 border border-gray-200">
                                <img
                                    src="/images/system-architecture.png"
                                    alt="Multi-Agent System Architecture"
                                    className="rounded-lg shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-green-600">Core AI Components</h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Transaction Analyzer Agent",
                                        desc: "Processes raw transaction data, extracts features, and identifies basic anomalies",
                                        tech: "Real-time stream processing"
                                    },
                                    {
                                        title: "Behavior Profiler Agent",
                                        desc: "Maintains individual user behavior models to detect deviations",
                                        tech: "Adaptive machine learning"
                                    },
                                    {
                                        title: "Regulation Checker Agent",
                                        desc: "Validates transactions against current financial regulations",
                                        tech: "Knowledge graph integration"
                                    },
                                    {
                                        title: "Alert Coordinator Agent",
                                        desc: "Correlates findings from all agents to generate actionable alerts",
                                        tech: "Decision fusion algorithms"
                                    }
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-400 hover:translate-x-1 transition-transform"
                                    >
                                        <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                                        <p className="text-gray-700 mb-2">{item.desc}</p>
                                        <span className="text-sm text-green-600 font-medium">{item.tech}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Proven Results
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Global Bank",
                                role: "Chief Risk Officer",
                                quote: "Reduced false positives by 62% while catching 43% more fraud cases in the first quarter",
                                stat: "78% reduction in fraud losses"
                            },
                            {
                                name: "Payment Processor",
                                role: "CTO",
                                quote: "The system identified sophisticated fraud patterns our old rules missed",
                                stat: "91% detection accuracy"
                            },
                            {
                                name: "Financial Regulator",
                                role: "Compliance Director",
                                quote: "Sets new standard for automated regulatory compliance in banking",
                                stat: "100% audit compliance"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden hover:-translate-y-1 transition-transform"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                                <div className="mb-6">
                                    <div className="text-5xl font-bold text-green-600 opacity-10 absolute top-4 right-4">"</div>
                                    <p className="text-lg italic relative z-10">"{item.quote}"</p>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-bold">{item.name}</h4>
                                    <p className="text-gray-600 text-sm">{item.role}</p>
                                    <div className="mt-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg inline-block text-sm font-medium">
                                        {item.stat}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Implementation Details
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                question: "How does the multi-agent architecture improve detection?",
                                answer: "Our system employs specialized AI agents that each focus on specific aspects of fraud detection (transaction analysis, behavior profiling, regulation checking). These agents collaborate through a decision fusion layer, combining their expertise to achieve higher accuracy than monolithic systems. The modular design also allows for targeted updates and scalability."
                            },
                            {
                                question: "What about regulatory compliance?",
                                answer: "The Regulation Checker Agent maintains an up-to-date knowledge graph of financial regulations across jurisdictions. It automatically validates transactions against relevant KYC, AML, and sanctions requirements, generating audit trails for compliance reporting. The system updates its knowledge base daily from regulatory publications."
                            },
                            {
                                question: "How quickly can we implement this solution?",
                                answer: "Typical deployment takes 4-6 weeks. We provide pre-trained models for common transaction patterns that can be customized with your specific data. Our cloud-native architecture allows for rapid scaling, and we offer both SaaS and on-premises deployment options."
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                            >
                                <details className="group">
                                    <summary className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                        <h3 className="font-semibold text-lg">{item.question}</h3>
                                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-6 pb-6 pt-2 bg-white">
                                        <p>{item.answer}</p>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 bg-gradient-to-br from-green-50 to-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Our Development Process
                    </h2>

                    <div className="relative">
                        {/* Timeline */}
                        <div className="hidden md:block absolute left-1/2 h-full w-0.5 bg-green-200 transform -translate-x-1/2"></div>

                        {[
                            {
                                year: "HackNUthon 6.0",
                                title: "Concept Validation",
                                desc: "Developed core multi-agent architecture during the hackathon",
                                icon: "💡"
                            },
                            {
                                year: "Phase 1",
                                title: "Bank Pilot Program",
                                desc: "Deployed with 3 financial institutions to validate detection rates",
                                icon: "🏁"
                            },
                            {
                                year: "Current",
                                title: "Enterprise Deployment",
                                desc: "Now protecting over $14B in transactions monthly",
                                icon: "🚀"
                            },
                            {
                                year: "Future",
                                title: "Predictive Prevention",
                                desc: "Developing predictive models to stop fraud before it occurs",
                                icon: "🔮"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`mb-12 md:flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                            >
                                <div className={`md:w-1/2 p-6 ${index % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12'}`}>
                                    <div className="inline-block bg-white p-4 rounded-full shadow-md text-2xl mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-green-600">{item.year}</h3>
                                    <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                                    <p className="text-gray-700">{item.desc}</p>
                                </div>
                                <div className="hidden md:block w-1/2 relative">
                                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                </div>
                                <div className="md:w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Homepage;