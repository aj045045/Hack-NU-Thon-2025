
export function OTPGeneratorUtil(): string {

    const length = 7;
    const charsetDigits = "0123456789";
    const charsetUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsetLowerCase = "abcdefghijklmnopqrstuvwxyz";
    let OTP = "";

    OTP += charsetDigits[Math.floor(Math.random() * charsetDigits.length)];
    OTP += charsetUpperCase[Math.floor(Math.random() * charsetUpperCase.length)];
    OTP += charsetLowerCase[Math.floor(Math.random() * charsetLowerCase.length)];

    for (let i = 3; i < length; i++) {
        const randomCharset = Math.floor(Math.random() * 3); // 0, 1, or 2
        switch (randomCharset) {
            case 0:
                OTP += charsetDigits[Math.floor(Math.random() * charsetDigits.length)];
                break;
            case 1:
                OTP += charsetUpperCase[Math.floor(Math.random() * charsetUpperCase.length)];
                break;
            case 2:
                OTP += charsetLowerCase[Math.floor(Math.random() * charsetLowerCase.length)];
                break;
        }
    }
    function shuffleString(str: string) {
        const array = str.split("");
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join("");
    }

    OTP = shuffleString(OTP);
    return OTP;
}