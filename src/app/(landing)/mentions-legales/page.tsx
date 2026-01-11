import { Header } from "@/components/marketing/header-navigation/header";
import { Footer } from "../footer";
import Link from "next/link";

export const metadata = {
    title: "Mentions Légales | Oyko",
    description: "Mentions légales du site Oyko",
};

export default function MentionsLegalesPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-primary pt-24 pb-16">
                <div className="mx-auto max-w-3xl px-4 md:px-8">
                    <h1 className="text-display-sm font-semibold text-primary md:text-display-md">
                        Mentions Légales
                    </h1>
                    <p className="mt-4 text-tertiary">
                        Dernière mise à jour : Janvier 2025
                    </p>

                    <div className="mt-12 space-y-10">
                        {/* Éditeur */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                1. Éditeur du site
                            </h2>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>Raison sociale :</strong> Oyko SAS</p>
                                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
                                <p><strong>Capital social :</strong> 10 000 €</p>
                                <p><strong>Siège social :</strong> 123 Rue de la Finance, 75001 Paris, France</p>
                                <p><strong>SIRET :</strong> 123 456 789 00012</p>
                                <p><strong>RCS :</strong> Paris B 123 456 789</p>
                                <p><strong>N° TVA intracommunautaire :</strong> FR12 123456789</p>
                                <p><strong>Email :</strong> <Link href="mailto:contact@oyko.fr" className="text-brand-600 hover:underline">contact@oyko.fr</Link></p>
                                <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                            </div>
                        </section>

                        {/* Directeur de publication */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                2. Directeur de la publication
                            </h2>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>Nom :</strong> Jean Dupont</p>
                                <p><strong>Qualité :</strong> Président</p>
                            </div>
                        </section>

                        {/* Hébergeur */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                3. Hébergement
                            </h2>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                                <p><strong>Site web :</strong> <Link href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">vercel.com</Link></p>
                            </div>
                            <div className="mt-4 space-y-2 text-secondary">
                                <p><strong>Base de données :</strong> Supabase Inc.</p>
                                <p><strong>Localisation des données :</strong> France (région eu-west-3)</p>
                            </div>
                        </section>

                        {/* Propriété intellectuelle */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                4. Propriété intellectuelle
                            </h2>
                            <p className="mt-4 text-secondary">
                                L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.)
                                est la propriété exclusive de Oyko SAS, à l'exception des marques, logos ou contenus
                                appartenant à d'autres sociétés partenaires ou auteurs.
                            </p>
                            <p className="mt-4 text-secondary">
                                Toute reproduction, distribution, modification, adaptation, retransmission ou publication,
                                même partielle, de ces différents éléments est strictement interdite sans l'accord
                                exprès par écrit de Oyko SAS.
                            </p>
                        </section>

                        {/* Responsabilité */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                5. Limitation de responsabilité
                            </h2>
                            <p className="mt-4 text-secondary">
                                Les informations contenues sur ce site sont aussi précises que possible et le site
                                est périodiquement mis à jour, mais peut toutefois contenir des inexactitudes, des
                                omissions ou des lacunes.
                            </p>
                            <p className="mt-4 text-secondary">
                                Oyko SAS ne pourra être tenue responsable des dommages directs et indirects causés
                                au matériel de l'utilisateur, lors de l'accès au site Oyko.
                            </p>
                        </section>

                        {/* Liens hypertextes */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                6. Liens hypertextes
                            </h2>
                            <p className="mt-4 text-secondary">
                                Le site Oyko peut contenir des liens hypertextes vers d'autres sites. Cependant,
                                Oyko SAS n'a pas la possibilité de vérifier le contenu des sites ainsi visités et
                                décline toute responsabilité de ce fait quant aux risques éventuels de contenus illicites.
                            </p>
                        </section>

                        {/* Droit applicable */}
                        <section>
                            <h2 className="text-xl font-semibold text-primary">
                                7. Droit applicable
                            </h2>
                            <p className="mt-4 text-secondary">
                                Les présentes mentions légales sont régies par le droit français. En cas de litige,
                                les tribunaux français seront seuls compétents.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
