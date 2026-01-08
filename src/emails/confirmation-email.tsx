import { Container, Html, Link, Preview } from "@react-email/components";
import { Body } from "@/components/emails/_components/body";
import { Button } from "@/components/emails/_components/button";
import { Head } from "@/components/emails/_components/head";
import { OykoFooter } from "@/components/emails/_components/oyko-footer";
import { OykoHeader } from "@/components/emails/_components/oyko-header";
import { Tailwind } from "@/components/emails/_components/tailwind";
import { Text } from "@/components/emails/_components/text";

interface ConfirmationEmailProps {
    confirmationUrl: string;
    userName?: string;
    email?: string;
    theme?: "light" | "dark";
}

export const ConfirmationEmail = ({
    confirmationUrl,
    userName,
    email,
    theme = "light"
}: ConfirmationEmailProps) => {
    return (
        <Html>
            <Tailwind theme={theme}>
                <Head />
                <Preview>Confirmez votre inscription sur Oyko</Preview>
                <Body>
                    <Container align="center" className="w-full max-w-160 bg-primary md:p-8">
                        <OykoHeader />
                        <Container align="left" className="max-w-full px-6 py-8">
                            <Text className="text-display-xs font-semibold text-primary">
                                Bienvenue sur Oyko !
                            </Text>

                            <Text className="mt-4 text-md text-tertiary">
                                {userName ? `Bonjour ${userName},` : "Bonjour,"}
                            </Text>

                            <Text className="mt-4 text-md text-tertiary">
                                Merci de vous être inscrit sur <span className="font-semibold text-primary">Oyko</span>.
                                Pour commencer à gérer vos finances personnelles, veuillez confirmer
                                votre adresse email en cliquant sur le bouton ci-dessous.
                            </Text>

                            <Button href={confirmationUrl} className="my-8">
                                <Text className="text-md font-semibold">Confirmer mon email</Text>
                            </Button>

                            <Text className="text-md text-tertiary">
                                Ce lien expire dans <span className="font-semibold">24 heures</span>.
                            </Text>

                            <Text className="mt-6 text-sm text-tertiary">
                                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                            </Text>
                            <Link href={confirmationUrl} className="mt-2 block text-sm text-brand-secondary break-all">
                                {confirmationUrl}
                            </Link>

                            <Text className="mt-8 text-md text-tertiary">
                                À très vite,
                                <br />
                                L&apos;équipe Oyko
                            </Text>
                        </Container>
                        <OykoFooter email={email} />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ConfirmationEmail;
