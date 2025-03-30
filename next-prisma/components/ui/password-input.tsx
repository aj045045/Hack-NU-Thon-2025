'use client'

import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false)
        const isDisabled = !props.value || props.disabled

        const togglePasswordVisibility = () => {
            setIsPasswordVisible((prev) => !prev)
        }

        return (
            <div className="relative">
                <Input
                    type={isPasswordVisible ? 'text' : 'password'}
                    className={cn(
                        'pr-10 [appearance:textfield] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={isDisabled}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                    {isPasswordVisible && !isDisabled ? (
                        <EyeIcon className="w-4 h-4" />
                    ) : (
                        <EyeOffIcon className="w-4 h-4" />
                    )}
                </Button>
            </div>
        )
    }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }