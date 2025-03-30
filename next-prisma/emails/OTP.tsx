import { OTPGeneratorUtil } from "@/helpers/otp-generator";
import { OTPEmailProps } from "@/interfaces/email";
import { Html, Head, Body, Tailwind, Text, Section, Img, Preview, Container, Heading, Hr } from "@react-email/components"


export default function OTPEmailComp({ task, code, emailId }: OTPEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>SZhoes Email Verification</Preview>
            <Tailwind>
                <Body className="bg-neutral-200 py-5 select-none">
                    <Container className="items-center bg-white rounded-md flex text-center flex-col font-sans ">
                        <Section>
                            <Img src="https://res.cloudinary.com/dq50dyxba/image/upload/v1743331599/logo_tqjree.png" className="w-60 p-2 my-2 mx-auto" />
                        </Section>
                        <Section>
                            <Heading className="text-3xl">Verify your email</Heading>
                            {/* <Text className="text-2xl" >Hi {name}</Text> */}
                        </Section>
                        <Section>
                            <Text>Use this code below to {task} in  SZhoes</Text>
                        </Section>
                        <Section className="px-5">
                            <Text className="bg-green-500 p-3 text-center text-4xl select-text">{code}</Text>
                            <Text>The code will expire in 5 minutes</Text>
                        </Section>
                        <Section>
                            <Text>This code will securely {task} using</Text>
                            <Text className="text-blue-500">{emailId}</Text>
                        </Section>
                        <Section>
                            <Hr />
                            <Text className="text-neutral-500">If you didn&apos;t request this email, there&apos;s nothing to worry about, you can safely ignore it.</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}


OTPEmailComp.PreviewProps = {
    task: "Register",
    code: OTPGeneratorUtil(),
    emailId: "aj045045@gmail.com"
}