import { Container, Html, Preview } from "@react-email/components";
import { Body } from "@/components/emails/_components/body";
import { Button } from "@/components/emails/_components/button";
import { LeftAligned as Footer } from "@/components/emails/_components/footer";
import { Head } from "@/components/emails/_components/head";
import { LeftAligned as Header } from "@/components/emails/_components/header";
import { Tailwind } from "@/components/emails/_components/tailwind";
import { Text } from "@/components/emails/_components/text";

export const SimpleInvite = ({ theme }: { theme?: "light" | "dark" }) => {
    return (
        <Html>
            <Tailwind theme={theme}>
                <Head />
                <Preview>Simple Invite</Preview>
                <Body>
                    <Container align="center" className="w-full max-w-160 bg-primary md:p-8">
                        <Header />
                        <Container align="left" className="max-w-full px-6 py-8">
                            <Text className="text-md text-tertiary">
                                Hi Olivia,
                                <br />
                                <br />
                                Alicia has invited you to join the team on <span className="text-md font-semibold">Untitled</span>.
                            </Text>
                            <Button href="https://www.untitledui.com/" className="my-6">
                                <Text className="text-md font-semibold">Accept the invite</Text>
                            </Button>
                            <Text className="text-md text-tertiary">
                                Thanks,
                                <br />
                                The team
                            </Text>
                        </Container>
                        <Footer />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
