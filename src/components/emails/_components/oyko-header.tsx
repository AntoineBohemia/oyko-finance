import { Container, Row } from "@react-email/components";
import { Text } from "./text";

export const OykoHeader = () => {
    return (
        <Container align="left" className="max-w-full bg-primary p-6">
            <Row>
                <Text className="text-display-xs font-bold text-brand-600">Oyko</Text>
            </Row>
        </Container>
    );
};

export const OykoHeaderCentered = () => {
    return (
        <Container align="center" className="max-w-full bg-primary p-6">
            <Row className="text-center">
                <Text className="text-display-xs font-bold text-brand-600">Oyko</Text>
            </Row>
        </Container>
    );
};
