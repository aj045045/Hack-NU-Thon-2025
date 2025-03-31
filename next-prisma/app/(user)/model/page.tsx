import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Model page"
}
export default function ModelPage() {
    return (
        <div className="grid grid-cols-2 gap-5 px-5">
            <Image height={500} className="rounded-md border border-green-500" width={500} src={'/mode_1.jpeg'} alt="Model 1" />
            <Image height={500} className="rounded-md border border-green-500" width={500} src={'/mode_2.jpeg'} alt="Model 1" />
            <Image height={500} className="rounded-md border border-green-500" width={500} src={'/model_3.jpeg'} alt="Model 1" />
        </div>
    )
}