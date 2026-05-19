import { Column, Container, Button as EmailButton, Row } from "@react-email/components";
import { Text } from "./text";

interface OykoFooterProps {
    email?: string;
}

export const OykoFooter = ({ email }: OykoFooterProps) => {
    return (
        <Container align="left" className="max-w-full bg-primary p-6 py-8">
            <Text className="text-sm text-tertiary">
                {email && (
                    <>
                        Cet email a été envoyé à{" "}
                        <span className="text-brand-secondary">{email}</span>.{" "}
                    </>
                )}
                Si vous n&apos;avez pas créé de compte sur Oyko, vous pouvez ignorer cet email.
            </Text>

            <Row className="mt-8">
                <Column>
                    <Text className="font-display text-display-xs font-bold text-gray-900">Oyko</Text>
                </Column>
            </Row>

            <Row className="mt-4">
                <Text className="text-sm text-tertiary">
                    © {new Date().getFullYear()} Oyko. Tous droits réservés.
                    <br />
                    <EmailButton href="https://oyko.space" className="text-brand-secondary">
                        <span className="underline">oyko.space</span>
                    </EmailButton>
                </Text>
            </Row>
        </Container>
    );
};

export const OykoFooterCentered = ({ email }: OykoFooterProps) => {
    return (
        <Container className="max-w-full bg-primary px-6 py-8">
            <Row>
                <Text className="text-center text-sm text-tertiary">
                    {email && (
                        <>
                            Cet email a été envoyé à{" "}
                            <span className="text-brand-secondary">{email}</span>.
                            <br />
                            <br />
                        </>
                    )}
                    Si vous n&apos;avez pas créé de compte sur Oyko, vous pouvez ignorer cet email.
                    <br />
                    <br />
                    © {new Date().getFullYear()} Oyko. Tous droits réservés.
                    <br />
                    <EmailButton href="https://oyko.space" className="text-brand-secondary">
                        <span className="underline">oyko.space</span>
                    </EmailButton>
                </Text>
            </Row>
        </Container>
    );
};
