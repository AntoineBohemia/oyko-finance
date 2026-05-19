"use client";

import { useState } from "react";
import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { HintText } from "@/components/base/input/hint-text";
import { Input, InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { cx } from "@/utils/cx";

export const SignupSplitAppMockup = () => {
    const [password, setPassword] = useState("");
    return (
        <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-2">
            <div className="flex flex-col bg-primary">
                <header className="hidden p-8 md:block">
                    <UntitledLogo />
                </header>
                <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8">
                    <div className="flex w-full flex-col gap-8 sm:max-w-90">
                        <div className="flex flex-col gap-6">
                            <UntitledLogoMinimal className="lg:hidden" />

                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-xl font-semibold text-primary md:text-display-xs">Sign up</h1>
                                <p className="text-md text-tertiary">Start your 30-day free trial.</p>
                            </div>
                        </div>

                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const data = Object.fromEntries(new FormData(e.currentTarget));
                                console.log("Form data:", data);
                            }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex flex-col gap-5">
                                <Input isRequired hideRequiredIndicator label="Name" name="name" placeholder="Enter your name" size="lg" />
                                <Input isRequired hideRequiredIndicator label="Email" type="email" name="email" placeholder="Enter your email" size="lg" />
                                <TextField isRequired size="lg" name="password" value={password} onChange={setPassword} minLength={8}>
                                    <Label isRequired={false}>Password</Label>
                                    <InputBase type="password" placeholder="Create a password" />
                                    <HintText className="flex items-center gap-1">
                                        <CheckCircle
                                            className={cx(
                                                "size-4 stroke-[2.25px] text-fg-quaternary group-invalid:text-fg-error-secondary",
                                                password.length >= 8 && "text-fg-success-primary",
                                            )}
                                        />
                                        Must be at least 8 characters.
                                    </HintText>
                                </TextField>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button type="submit" size="lg">
                                    Get started
                                </Button>
                                <SocialButton social="google" theme="color">
                                    Sign up with Google
                                </SocialButton>
                            </div>
                        </Form>

                        <div className="flex justify-center gap-1 text-center">
                            <span className="text-sm text-tertiary">Already have an account?</span>
                            <Button href="#" color="link-color" size="md">
                                Log in
                            </Button>
                        </div>
                    </div>
                </div>
                <footer className="hidden justify-between p-8 pt-11 lg:flex">
                    <p className="text-sm text-tertiary">© Untitled UI 2077</p>

                    <a href="mailto:help@untitledui.com" className="flex items-center gap-2 text-sm text-tertiary">
                        <Mail01 className="size-4 text-fg-quaternary" />
                        help@untitledui.com
                    </a>
                </footer>
            </div>

            <div className="relative hidden items-center overflow-hidden bg-secondary pt-32 pb-8 lg:flex">
                <img
                    src="https://www.untitledui.com/marketing/screen-mockups/screen-split-app-3-2.webp"
                    className="absolute left-[187px] h-200 object-contain"
                    alt="Mobile app interface mockup"
                />
            </div>
        </section>
    );
};
