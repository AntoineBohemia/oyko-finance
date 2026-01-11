import { Header } from "@/components/marketing/header-navigation/header";
import { Footer } from "../footer";
import Link from "next/link";

export const metadata = {
    title: "Conditions Générales d'Utilisation | Oyko",
    description: "Conditions générales d'utilisation du service Oyko",
};

export default function CGUPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-primary pt-24 pb-16">
                <div className="mx-auto max-w-3xl px-4 md:px-8">
                    <h1 className="text-display-sm font-semibold text-primary md:text-display-md">
                        Conditions Générales d'Utilisation
                    </h1>
                    <p className="mt-4 text-tertiary">
                        Dernière mise à jour : Janvier 2025
                    </p>

                    <div className="mt-12 space-y-10">
                        {/* Objet */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                1. Objet
                            </h2>
                            <p className="mt-4 text-secondary">
                                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir
                                les modalités et conditions d'utilisation du service Oyko, ainsi que de définir
                                les droits et obligations des parties dans ce cadre.
                            </p>
                            <p className="mt-4 text-secondary">
                                Oyko est une application de gestion de finances personnelles permettant de suivre
                                ses dépenses, gérer son budget et visualiser son patrimoine.
                            </p>
                        </section>

                        {/* Acceptation */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                2. Acceptation des CGU
                            </h2>
                            <p className="mt-4 text-secondary">
                                L'utilisation du service Oyko implique l'acceptation pleine et entière des présentes CGU.
                                En créant un compte ou en utilisant le service, vous reconnaissez avoir lu, compris et
                                accepté l'ensemble de ces conditions.
                            </p>
                            <p className="mt-4 text-secondary">
                                Oyko se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
                                seront informés de toute modification par email ou notification dans l'application.
                            </p>
                        </section>

                        {/* Inscription */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                3. Inscription et compte utilisateur
                            </h2>
                            <p className="mt-4 text-secondary">
                                Pour utiliser Oyko, vous devez créer un compte en fournissant des informations exactes et complètes.
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Vous devez être âgé d'au moins 18 ans</li>
                                <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
                                <li>Un seul compte par personne est autorisé</li>
                            </ul>
                        </section>

                        {/* Description du service */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                4. Description du service
                            </h2>
                            <p className="mt-4 text-secondary">
                                Oyko propose les fonctionnalités suivantes :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Synchronisation sécurisée de vos comptes bancaires</li>
                                <li>Catégorisation automatique des transactions</li>
                                <li>Création et suivi de budgets</li>
                                <li>Visualisation de votre patrimoine</li>
                                <li>Rapports et analyses financières</li>
                                <li>Objectifs d'épargne</li>
                            </ul>
                            <p className="mt-4 text-secondary">
                                Le service est fourni "en l'état". Oyko s'efforce d'assurer la disponibilité du service
                                24h/24 et 7j/7, mais ne peut garantir une disponibilité ininterrompue.
                            </p>
                        </section>

                        {/* Tarification */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                5. Tarification
                            </h2>
                            <p className="mt-4 text-secondary">
                                Oyko propose une offre gratuite avec des fonctionnalités de base et des offres
                                premium avec des fonctionnalités avancées. Les tarifs sont indiqués sur notre site
                                et peuvent être modifiés à tout moment.
                            </p>
                            <p className="mt-4 text-secondary">
                                En cas de modification tarifaire, les utilisateurs existants seront prévenus 30 jours
                                avant l'entrée en vigueur des nouveaux tarifs.
                            </p>
                        </section>

                        {/* Obligations de l'utilisateur */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                6. Obligations de l'utilisateur
                            </h2>
                            <p className="mt-4 text-secondary">
                                L'utilisateur s'engage à :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Utiliser le service de manière conforme à sa destination</li>
                                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                                <li>Ne pas utiliser le service à des fins illégales</li>
                                <li>Ne pas partager son compte avec des tiers</li>
                                <li>Fournir des informations exactes et à jour</li>
                                <li>Respecter les droits de propriété intellectuelle</li>
                            </ul>
                        </section>

                        {/* Propriété intellectuelle */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                7. Propriété intellectuelle
                            </h2>
                            <p className="mt-4 text-secondary">
                                L'ensemble des éléments du service Oyko (logiciels, interface, design, marques, logos)
                                sont la propriété exclusive de Oyko SAS et sont protégés par les lois relatives à la
                                propriété intellectuelle.
                            </p>
                            <p className="mt-4 text-secondary">
                                L'utilisateur dispose d'un droit d'utilisation personnel, non exclusif et non transférable
                                du service, dans le cadre de son usage personnel.
                            </p>
                        </section>

                        {/* Données personnelles */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                8. Données personnelles
                            </h2>
                            <p className="mt-4 text-secondary">
                                Le traitement de vos données personnelles est régi par notre{" "}
                                <Link href="/politique-confidentialite" className="text-brand-600 hover:underline">
                                    Politique de Confidentialité
                                </Link>
                                , qui fait partie intégrante des présentes CGU.
                            </p>
                        </section>

                        {/* Responsabilité */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                9. Limitation de responsabilité
                            </h2>
                            <p className="mt-4 text-secondary">
                                Oyko s'engage à mettre en œuvre tous les moyens nécessaires pour assurer la qualité
                                et la continuité du service. Toutefois, Oyko ne saurait être tenu responsable :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Des interruptions temporaires du service pour maintenance</li>
                                <li>Des dommages résultant d'une utilisation non conforme du service</li>
                                <li>De l'exactitude des informations fournies par les établissements bancaires</li>
                                <li>Des décisions financières prises sur la base des informations du service</li>
                                <li>Des problèmes de connexion liés aux opérateurs ou FAI</li>
                            </ul>
                            <p className="mt-4 text-secondary font-medium">
                                Important : Oyko est un outil d'aide à la gestion financière et ne constitue pas
                                un conseil en investissement. Consultez un professionnel pour toute décision financière importante.
                            </p>
                        </section>

                        {/* Résiliation */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                10. Résiliation
                            </h2>
                            <p className="mt-4 text-secondary">
                                L'utilisateur peut résilier son compte à tout moment depuis les paramètres de l'application
                                ou en contactant le support.
                            </p>
                            <p className="mt-4 text-secondary">
                                Oyko se réserve le droit de suspendre ou résilier un compte en cas de :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Violation des présentes CGU</li>
                                <li>Utilisation frauduleuse du service</li>
                                <li>Non-paiement des sommes dues (offres premium)</li>
                                <li>Inactivité prolongée du compte (plus de 24 mois)</li>
                            </ul>
                        </section>

                        {/* Support */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                11. Support et contact
                            </h2>
                            <p className="mt-4 text-secondary">
                                Pour toute question ou réclamation concernant le service, vous pouvez nous contacter :
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary">
                                <li>Par email : <Link href="mailto:support@oyko.fr" className="text-brand-600 hover:underline">support@oyko.fr</Link></li>
                                <li>Via le formulaire de contact dans l'application</li>
                            </ul>
                            <p className="mt-4 text-secondary">
                                Nous nous engageons à répondre dans un délai de 48 heures ouvrées.
                            </p>
                        </section>

                        {/* Droit applicable */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                12. Droit applicable et litiges
                            </h2>
                            <p className="mt-4 text-secondary">
                                Les présentes CGU sont régies par le droit français.
                            </p>
                            <p className="mt-4 text-secondary">
                                En cas de litige, les parties s'engagent à rechercher une solution amiable.
                                Conformément à l'article L.612-1 du Code de la consommation, vous pouvez recourir
                                gratuitement au service de médiation de la consommation.
                            </p>
                            <p className="mt-4 text-secondary">
                                À défaut de résolution amiable, les tribunaux de Paris seront seuls compétents.
                            </p>
                        </section>

                        {/* Divisibilité */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                13. Divisibilité
                            </h2>
                            <p className="mt-4 text-secondary">
                                Si une ou plusieurs stipulations des présentes CGU sont tenues pour non valides ou
                                déclarées comme telles en application d'une loi, d'un règlement ou d'une décision
                                définitive d'une juridiction compétente, les autres stipulations garderont toute
                                leur force et leur portée.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
