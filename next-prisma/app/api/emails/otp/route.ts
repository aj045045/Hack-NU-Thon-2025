import OTPEmailComp from "@/emails/OTP";
import { transporter } from "@/helpers/transporter";
import { OTPEmailProps } from "@/interfaces/email";
import { render } from '@react-email/components';

export async function POST(request: Request) {
    try {
        const { code, emailId, task }: OTPEmailProps = await request.json();
        const emailHtml = await render(OTPEmailComp({ task, code, emailId }));

        const options = {
            from: 'no-reply@app.com',
            to: emailId,
            subject: `App: ${task} Email Id Verification`,
            html: emailHtml,
        };

        const info = await transporter.sendMail(options);
        if (info.accepted.length > 0) {
            return new Response(JSON.stringify({ status: 'success', message: 'Email sent successfully' }), { status: 200 });
        } else {
            console.error("Error while sending email");
            return new Response(JSON.stringify({ status: "error", message: 'Failed to send email' }), { status: 500 });
        }
    } catch (error) {
        console.error("Error processing request", error);
        return new Response(JSON.stringify({ status: "error", message: 'Internal server error', error }), { status: 500 });
    }
}