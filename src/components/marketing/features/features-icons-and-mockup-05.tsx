"use client";

import { ChartBreakoutSquare, MessageChatCircle, MessageSmileCircle, Zap } from "@untitledui/icons";
import { ActiveUsersChart } from "@/components/marketing/features/base-components/active-users-chart";
import { FeatureTextFeaturedIconTopLeft } from "./base-components/feature-text";
import { UsersChart } from "./base-components/users-chart";

export const FeaturesIconsAndMockup05 = () => {
    return (
        <section className="overflow-hidden bg-primary py-16 lg:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <div className="mx-auto flex w-full flex-col md:text-center lg:max-w-3xl">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Features</span>

                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Cutting-edge features for advanced analytics</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                        Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.
                    </p>
                </div>

                <div className="z-10 mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-2 md:gap-16 lg:grid-cols-12 lg:items-start lg:gap-0">
                    <ul className="grid grid-cols-1 gap-x-8 gap-y-10 md:gap-y-12 lg:col-span-3">
                        {[
                            {
                                title: "Share team inboxes",
                                subtitle: "Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.",
                                icon: MessageChatCircle,
                            },
                            {
                                title: "Deliver instant answers",
                                subtitle: "An all-in-one customer service platform that helps you balance everything your customers need to be happy.",
                                icon: Zap,
                            },
                        ].map((item) => (
                            <li key={item.title}>
                                <FeatureTextFeaturedIconTopLeft icon={item.icon} title={item.title} subtitle={item.subtitle} />
                            </li>
                        ))}
                    </ul>

                    <div className="relative order-last mt-2 flex w-full max-w-full items-start md:col-span-2 md:mt-0 lg:order-none lg:col-span-6 lg:px-16">
                        <div className="relative w-full">
                            <UsersChart className="lg:h-96 lg:w-full" />
                            <div className="absolute -right-16 -bottom-10 md:-right-6 md:-bottom-30">
                                <ActiveUsersChart className="size-[192px] md:size-[232px]" />
                            </div>
                        </div>
                    </div>

                    <ul className="z-10 grid grid-cols-1 gap-x-8 gap-y-10 md:gap-y-12 lg:col-span-3">
                        {[
                            {
                                title: "Manage your team with reports",
                                subtitle:
                                    "Measure what matters with Untitled's easy-to-use reports. You can filter, export, and drilldown on the data in a couple clicks.",
                                icon: ChartBreakoutSquare,
                            },
                            {
                                title: "Connect with customers",
                                subtitle:
                                    "Solve a problem or close a sale in real-time with chat. If no one is available, customers are seamlessly routed to email without confusion.",
                                icon: MessageSmileCircle,
                            },
                        ].map((item) => (
                            <li key={item.title}>
                                <FeatureTextFeaturedIconTopLeft icon={item.icon} title={item.title} subtitle={item.subtitle} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};
