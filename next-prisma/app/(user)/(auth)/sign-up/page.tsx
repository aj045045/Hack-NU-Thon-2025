import { assetsLinks } from "@/constants/assets";
import Image from "next/image";
import { SignUpForm } from "./form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sing Up",
};

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="grid w-4/5 max-w-4xl grid-cols-1 overflow-hidden rounded-xl md:grid-cols-2 bg-lime-50">
                {/* Image Section */}
                <div className="flex items-center justify-center p-10 bg-lime-700 md:rounded-l-xl rounded-t-xl md:rounded-t-none">
                    <Image
                        src={assetsLinks.sign_up.src}
                        alt={assetsLinks.sign_up.alt}
                        width={500}
                        height={500}
                        className="rounded-xl max-w-80"
                        priority
                    />
                </div>
                <div className="p-6">
                    <SignUpForm />
                </div>
            </div>
        </div>
    );
}
