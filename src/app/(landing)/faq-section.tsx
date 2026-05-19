"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { cx } from "@/utils/cx";

// =============================================================================
// DATA
// =============================================================================

const faqs = [
    {
        question: "Oyko est-il vraiment gratuit ?",
        answer: "Oui, Oyko est 100% gratuit. Nous ne proposons pas de version payante. Notre objectif est de rendre la gestion financière accessible à tous.",
    },
    {
        question: "Mes données bancaires sont-elles sécurisées ?",
        answer: "Absolument. Nous utilisons un chiffrement de niveau bancaire (AES-256) et ne stockons jamais vos identifiants. La connexion à vos banques se fait via des partenaires agréés par l'ACPR.",
    },
    {
        question: "Quelles banques sont compatibles ?",
        answer: "Oyko est compatible avec plus de 350 banques françaises et européennes, incluant toutes les grandes banques (BNP, SG, CA, etc.) ainsi que les néobanques (Revolut, N26, Boursorama...).",
    },
    {
        question: "Comment fonctionne la catégorisation automatique ?",
        answer: "Notre algorithme analyse vos transactions et les classe automatiquement dans des catégories (alimentation, transport, loisirs...). Vous pouvez aussi créer vos propres catégories et règles.",
    },
    {
        question: "Puis-je utiliser Oyko sur mobile ?",
        answer: "Oui, Oyko est disponible en version web responsive et fonctionne parfaitement sur mobile. Une application native iOS et Android est prévue pour bientôt.",
    },
    {
        question: "Comment sont générés les budgets intelligents ?",
        answer: "Oyko analyse vos habitudes de dépenses sur les 3 derniers mois et vous suggère des budgets réalistes. Vous pouvez les ajuster selon vos objectifs.",
    },
];

// =============================================================================
// ACCORDION ITEM
// =============================================================================

const ease = [0.16, 1, 0.3, 1] as const;

const AccordionItem = ({ question, answer, isOpen, onToggle, index }: { question: string; answer: string; isOpen: boolean; onToggle: () => void; index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });

    return (
    <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 25 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease, delay: index * 0.08 }}
        className="relative border-t border-secondary pt-5 first:border-t-0 first:pt-0 md:pt-6"
    >
        {/* Glow subtil sur question ouverte */}
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="pointer-events-none absolute -inset-2 -z-10 rounded-xl"
                    style={{ background: "radial-gradient(ellipse at center, rgba(190,255,0,0.04), transparent 70%)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    aria-hidden="true"
                />
            )}
        </AnimatePresence>

        <h3>
            <button
                onClick={onToggle}
                className={cx(
                    // Base
                    "flex w-full cursor-pointer items-start justify-between gap-3 text-left",
                    // Touch target étendu
                    "-m-2 min-h-11 rounded-xl p-2",
                    // States
                    "outline-focus-ring transition-colors duration-150 select-none",
                    "active:bg-secondary",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "md:gap-6",
                )}
            >
                <span className="text-sm font-semibold text-primary md:text-md">{question}</span>
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center text-fg-quaternary">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <motion.line
                            x1="12" y1="8" x2="12" y2="16"
                            animate={{ rotate: isOpen ? -90 : 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            style={{ transformOrigin: "center" }}
                        />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                </span>
            </button>
        </h3>

        <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
            }}
            transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
            }}
        >
            <div className="pt-2 pr-10 md:pr-12">
                <motion.p
                    className="text-sm text-tertiary md:text-md"
                    initial={false}
                    animate={{
                        clipPath: isOpen ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                >
                    {answer}
                </motion.p>
            </div>
        </motion.div>
    </motion.div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const FaqSection = () => {
    const [openQuestions, setOpenQuestions] = useState(new Set([0]));

    const handleToggle = (index: number) => {
        const newOpenQuestions = new Set(openQuestions);
        if (newOpenQuestions.has(index)) {
            newOpenQuestions.delete(index);
        } else {
            newOpenQuestions.add(index);
        }
        setOpenQuestions(newOpenQuestions);
    };

    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

    return (
        <section className="relative bg-primary py-12 md:py-24">

            <div className="mx-auto max-w-container px-4 md:px-8">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    className="flex flex-col md:items-center md:text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <span className="text-sm font-semibold text-brand-secondary">FAQ</span>
                    <h2 className="mt-2 text-display-xs font-semibold text-primary md:mt-3 md:text-display-md">Questions fréquentes</h2>
                    <p className="mt-3 text-md text-tertiary md:mt-5 md:text-xl">Tout ce que vous devez savoir sur Oyko.</p>
                </motion.div>

                {/* Accordion */}
                <div className="mx-auto mt-8 max-w-3xl md:mt-16">
                    <div className="flex flex-col gap-5 md:gap-6">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={faq.question}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openQuestions.has(index)}
                                onToggle={() => handleToggle(index)}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
