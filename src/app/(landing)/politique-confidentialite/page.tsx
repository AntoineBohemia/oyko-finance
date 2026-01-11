import { Header } from "@/components/marketing/header-navigation/header";
import { Footer } from "../footer";
import Link from "next/link";

export const metadata = {
    title: "Politique de Confidentialité | Oyko",
    description: "Politique de confidentialité et protection des données personnelles",
};

export default function PolitiqueConfidentialitePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-primary pt-24 pb-16">
                <div className="mx-auto max-w-3xl px-4 md:px-8">
                    <h1 className="text-display-sm font-semibold text-primary md:text-display-md">
                        Politique de Confidentialité
                    </h1>
                    <p className="mt-4 text-tertiary">
                        Dernière mise à jour : Janvier 2025
                    </p>

                    <div className="mt-12 space-y-10">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                1. Introduction
                            </h2>
                            <p className="mt-4 text-secondary">
                                Chez Oyko, nous accordons une grande importance à la protection de vos données personnelles.
                                Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons
                                et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD).
                            </p>
                        </section>

                        {/* Responsable du traitement */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                2. Responsable du traitement
                            </h2>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>Oyko SAS</strong></p>
                                <p>123 Rue de la Finance, 75001 Paris, France</p>
                                <p>Email : <Link href="mailto:dpo@oyko.fr" className="text-brand-600 hover:underline">dpo@oyko.fr</Link></p>
                            </div>
                        </section>

                        {/* Données collectées */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                3. Données collectées
                            </h2>
                            <p className="mt-4 text-secondary">
                                Nous collectons les catégories de données suivantes :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                                <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, type de navigateur</li>
                                <li><strong>Données financières :</strong> transactions bancaires (via agrégation sécurisée), catégories de dépenses, budgets</li>
                                <li><strong>Données d'utilisation :</strong> préférences, paramètres de l'application</li>
                            </ul>
                        </section>

                        {/* Finalités */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                4. Finalités du traitement
                            </h2>
                            <p className="mt-4 text-secondary">
                                Vos données sont traitées pour les finalités suivantes :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Fourniture et gestion de votre compte Oyko</li>
                                <li>Synchronisation et agrégation de vos comptes bancaires</li>
                                <li>Analyse de vos dépenses et création de rapports personnalisés</li>
                                <li>Amélioration de nos services et de l'expérience utilisateur</li>
                                <li>Communication (notifications, newsletters si consentement)</li>
                                <li>Sécurité et prévention de la fraude</li>
                            </ul>
                        </section>

                        {/* Base légale */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                5. Base légale du traitement
                            </h2>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Exécution du contrat :</strong> fourniture du service Oyko</li>
                                <li><strong>Consentement :</strong> newsletters, cookies non essentiels</li>
                                <li><strong>Intérêt légitime :</strong> amélioration du service, sécurité</li>
                                <li><strong>Obligation légale :</strong> conservation des données de facturation</li>
                            </ul>
                        </section>

                        {/* Durée de conservation */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                6. Durée de conservation
                            </h2>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Données du compte :</strong> durée de l'utilisation du service + 3 ans après suppression</li>
                                <li><strong>Données financières :</strong> durée de l'utilisation du service</li>
                                <li><strong>Données de connexion :</strong> 1 an</li>
                                <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
                            </ul>
                        </section>

                        {/* Partage des données */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                7. Partage des données
                            </h2>
                            <p className="mt-4 text-secondary">
                                Vos données peuvent être partagées avec :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Prestataires techniques :</strong> hébergement (Vercel, Supabase), agrégation bancaire</li>
                                <li><strong>Sous-traitants :</strong> uniquement avec des garanties contractuelles appropriées</li>
                            </ul>
                            <p className="mt-4 text-secondary">
                                Nous ne vendons jamais vos données personnelles à des tiers.
                            </p>
                        </section>

                        {/* Transferts hors UE */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                8. Transferts hors Union Européenne
                            </h2>
                            <p className="mt-4 text-secondary">
                                Certains de nos prestataires sont situés hors de l'UE (notamment Vercel aux USA).
                                Ces transferts sont encadrés par des clauses contractuelles types approuvées par
                                la Commission Européenne ou par des décisions d'adéquation.
                            </p>
                        </section>

                        {/* Sécurité */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                9. Sécurité des données
                            </h2>
                            <p className="mt-4 text-secondary">
                                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Chiffrement AES-256 des données sensibles</li>
                                <li>Chiffrement TLS pour toutes les communications</li>
                                <li>Authentification à deux facteurs disponible</li>
                                <li>Hébergement des données en France</li>
                                <li>Audits de sécurité réguliers</li>
                            </ul>
                        </section>

                        {/* Droits des utilisateurs */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                10. Vos droits
                            </h2>
                            <p className="mt-4 text-secondary">
                                Conformément au RGPD, vous disposez des droits suivants :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                            </ul>
                            <p className="mt-4 text-secondary">
                                Pour exercer ces droits, contactez-nous à : <Link href="mailto:dpo@oyko.fr" className="text-brand-600 hover:underline">dpo@oyko.fr</Link>
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                11. Cookies
                            </h2>
                            <p className="mt-4 text-secondary">
                                Notre site utilise des cookies pour :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li><strong>Cookies essentiels :</strong> fonctionnement du site, authentification</li>
                                <li><strong>Cookies analytiques :</strong> mesure d'audience (avec votre consentement)</li>
                            </ul>
                            <p className="mt-4 text-secondary">
                                Vous pouvez gérer vos préférences cookies à tout moment via les paramètres de votre navigateur.
                            </p>
                        </section>

                        {/* Réclamation */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                12. Réclamation
                            </h2>
                            <p className="mt-4 text-secondary">
                                Si vous estimez que le traitement de vos données ne respecte pas la réglementation,
                                vous pouvez introduire une réclamation auprès de la CNIL :
                            </p>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>CNIL</strong></p>
                                <p>3 Place de Fontenoy, TSA 80715</p>
                                <p>75334 Paris Cedex 07</p>
                                <p>Site : <Link href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">www.cnil.fr</Link></p>
                            </div>
                        </section>

                        {/* Modification */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                13. Modification de la politique
                            </h2>
                            <p className="mt-4 text-secondary">
                                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                                Les modifications seront publiées sur cette page avec une date de mise à jour.
                                Nous vous informerons par email en cas de modification substantielle.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
