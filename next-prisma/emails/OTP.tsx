import { OTPGeneratorUtil } from "@/helpers/otp-generator";
import { OTPEmailProps } from "@/interfaces/email";
import { Html, Head, Body, Tailwind, Text, Section, Img, Preview, Container, Heading, Hr } from "@react-email/components"


export default function OTPEmailComp({ task, code, emailId }: OTPEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>SZhoes Email Verification</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-5 select-none">
                    <Container className="items-center bg-green-50 rounded-md flex text-center flex-col font-sans border border-green-200 shadow-md">
                        <Section className="bg-green-300 w-full rounded-t-md py-2">
                            <Img src="https://res.cloudinary.com/dvvaf3oih/image/upload/v1732465488/icon_hgrz7f.png" className="w-28 p-2 my-2 mx-auto" />
                        </Section>
                        <Section className="mt-4">
                            <Heading className="text-3xl text-green-1000">Verify your email</Heading>
                        </Section>
                        <Section>
                            <Text className="text-green-700">Use this code below to {task} in SZhoes</Text>
                        </Section>
                        <Section className="px-5 py-3">
                            <Text className="bg-white border-2 border-green-300 p-3 text-center text-4xl select-text font-bold text-green-800 rounded-md">{code}</Text>
                            <Text className="text-green-600 text-sm mt-2">The code will expire in 5 minutes</Text>
                        </Section>
                        <Section className="bg-white p-4 rounded-md mx-4 my-2 border border-green-200">
                            <Text className="text-green-700">This code will securely {task} using</Text>
                            <Text className="text-green-500 font-medium">{emailId}</Text>
                        </Section>
                        <Section className="mt-4">
                            <Hr className="border-green-100" />
                            <Text className="text-green-600 text-sm px-4 pb-4">If you didn&apos;t request this email, there&apos;s nothing to worry about, you can safely ignore it.</Text>
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