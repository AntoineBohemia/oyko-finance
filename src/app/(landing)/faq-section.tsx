"use client";

import { useState } from "react";
import { motion } from "motion/react";
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

const AccordionItem = ({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) => (
    <div className="border-t border-secondary pt-6 first:border-t-0 first:pt-0">
        <h3>
            <button
                onClick={onToggle}
                className={cx(
                    "flex w-full cursor-pointer items-start justify-between gap-2 text-left",
                    "rounded-md outline-focus-ring select-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "md:gap-6",
                )}
            >
                <span className="text-md font-semibold text-primary">{question}</span>
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center text-fg-quaternary">
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
                        <line className={cx("origin-center transition duration-150 ease-out", isOpen && "-rotate-90")} x1="12" y1="8" x2="12" y2="16" />
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
                damping: 24,
                stiffness: 240,
                bounce: 0.4,
            }}
        >
            <div className="pt-1 pr-8 md:pr-12">
                <p className="text-md text-tertiary">{answer}</p>
            </div>
        </motion.div>
    </div>
);

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

    return (
        <section className="relative bg-primary py-16 md:py-24">
            {/* Gradient de transition depuis la section précédente */}
            <div
                className="pointer-events-none absolute inset-x-0 -top-24 h-32"
                style={{
                    background: "linear-gradient(to bottom, transparent, var(--color-bg-primary) 70%)",
                }}
                aria-hidden="true"
            />
            <div className="mx-auto max-w-container px-4 md:px-8">
                {/* Header */}
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">FAQ</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Questions fréquentes</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">Tout ce que vous devez savoir sur Oyko.</p>
                </div>

                {/* Accordion */}
                <div className="mx-auto mt-12 max-w-3xl md:mt-16">
                    <div className="flex flex-col gap-6">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={faq.question}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openQuestions.has(index)}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
