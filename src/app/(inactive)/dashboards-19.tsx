"use client";

import { Fragment } from "react";
import { ArrowRight, BarChartSquare02, CheckDone01, Edit01, HomeLine, PieChart03, Rows01, Send01, Users01 } from "@untitledui/icons";
import { Area, AreaChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ResponsiveContainer, YAxis } from "recharts";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { ContentDivider } from "@/components/application/content-divider/content-divider";
import type { Message } from "@/components/application/messaging/messaging";
import { MessageItem } from "@/components/application/messaging/messaging";
import { Table, TableRowActionsDropdown } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Dot } from "@/components/foundations/dot-icon";
import { useBreakpoint } from "@/hooks/use-breakpoint";

// Helper function for formatting relative time
const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
        return "Just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInDays === 1) {
        // Yesterday - show time
        const date = new Date(timestamp);
        const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        return `Yesterday ${time.toLowerCase()}`;
    } else if (diffInDays <= 7) {
        // Within a week - show day and time
        const date = new Date(timestamp);
        const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
        const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        return `${dayOfWeek} ${time.toLowerCase()}`;
    } else {
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    }
};

const biggestFans = [
    {
        id: "user-01",
        name: "Phoenix Baker",
        username: "@phoenix.baker",
        likes: 24,
        avatarUrl: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
    },
    {
        id: "user-02",
        name: "Lana Steiner",
        username: "@lanasteiner",
        likes: 22,
        avatarUrl: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
    },
    {
        id: "user-03",
        name: "Demi Wilkinson",
        username: "@demi_wilkinson",
        likes: 22,
        avatarUrl: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
    },
    {
        id: "user-04",
        name: "Candice Wu",
        username: "@candicewu",
        likes: 20,
        avatarUrl: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80",
    },
    {
        id: "user-05",
        name: "Natali Craig",
        username: "@nat.craig",
        likes: 18,
        avatarUrl: "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80",
    },
    {
        id: "user-06",
        name: "Drew Cano",
        username: "@drewc",
        likes: 16,
        avatarUrl: "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80",
    },
    {
        id: "user-07",
        name: "Orlando Diggs",
        username: "@orlando_diggs",
        likes: 12,
        avatarUrl: "https://www.untitledui.com/images/avatars/orlando-diggs?fm=webp&q=80",
    },
];

const favoriteDesigners = [
    {
        id: "user-08",
        name: "Andi Lane",
        username: "@andilane",
        likes: 46,
        avatarUrl: "https://www.untitledui.com/images/avatars/andi-lane?fm=webp&q=80",
    },
    {
        id: "user-09",
        name: "Kate Morrison",
        username: "@kmorrison",
        likes: 40,
        avatarUrl: "https://www.untitledui.com/images/avatars/kate-morrison?fm=webp&q=80",
    },
    {
        id: "user-10",
        name: "Koray Okumus",
        username: "@korayy",
        likes: 36,
        avatarUrl: "https://www.untitledui.com/images/avatars/koray-okumus?fm=webp&q=80",
    },
    {
        id: "user-11",
        name: "Ava Wright",
        username: "@avawright",
        likes: 34,
        avatarUrl: "https://www.untitledui.com/images/avatars/ava-wright?fm=webp&q=80",
    },
    {
        id: "user-12",
        name: "Eve Leroy",
        username: "@eve.leroy",
        likes: 30,
        avatarUrl: "https://www.untitledui.com/images/avatars/eve-leroy?fm=webp&q=80",
    },
    {
        id: "user-13",
        name: "Zahir Mays",
        username: "@zahir_mays",
        likes: 28,
        avatarUrl: "https://www.untitledui.com/images/avatars/zahir-mays?fm=webp&q=80",
    },
    {
        id: "user-14",
        name: "Joshua Wilson",
        username: "@joshwilson",
        likes: 28,
        avatarUrl: "https://www.untitledui.com/images/avatars/joshua-wilson?fm=webp&q=80",
    },
];

const messageGroups: Array<Array<Omit<Message, "sentAt"> & { sentAt: number }>> = [
    [
        {
            id: "msg-00",
            sentAt: new Date(2025, 6, 31, 11, 39).getTime(),
            user: {
                me: true,
            },
            text: "Hey Olivia. We're working on a dashboard prototype and love your work. Are you open to new projects?",
        },
        {
            id: "msg-01",
            sentAt: new Date(2025, 6, 31, 11, 40).getTime(),
            user: {
                me: true,
            },
            text: "Hey Anita, I have some capacity in a few weeks. Can you tell me a little more about the project?",
        },
        {
            id: "msg-02",
            sentAt: new Date(2025, 6, 31, 12, 14).getTime(),
            user: {
                name: "Anita Cruz",
                avatarUrl: "https://www.untitledui.com/images/avatars/anita-cruz?fm=webp&q=80",
                status: "online",
            },
            text: "Great! We've drafted an outline here. Let me know if you have any questions!",
        },
        {
            id: "msg-03",
            sentAt: new Date(2025, 6, 31, 12, 14).getTime(),
            user: {
                name: "Anita Cruz",
                avatarUrl: "https://www.untitledui.com/images/avatars/anita-cruz?fm=webp&q=80",
                status: "online",
            },
            attachment: {
                type: "pdf",
                name: "Dashboard Design Brief.pdf",
                size: "800 KB",
            },
        },
        {
            id: "msg-04",
            sentAt: new Date(2025, 6, 31, 12, 29).getTime(),
            user: {
                me: true,
            },
            text: "I'll have a more thorough read and get back to you by tomorrow. Is that okay?",
            reactions: [
                { content: "❤️‍🔥", count: 1 },
                { content: "👌", count: 1 },
            ],
        },
        {
            id: "msg-05",
            sentAt: new Date(2025, 6, 31, 12, 30).getTime(),
            user: {
                name: "Anita Cruz",
                avatarUrl: "https://www.untitledui.com/images/avatars/anita-cruz?fm=webp&q=80",
                status: "online",
            },
            text: "Sounds perfect, thanks!",
        },
    ],
    [
        {
            id: "msg-10",
            sentAt: Date.now() - 10 * 60 * 1000,
            user: {
                me: true,
            },
            text: "Hey Anita, I've had a read through and made some notes:https://docs.google.com/docu...",
        },
        {
            id: "msg-11",
            sentAt: Date.now() - 30 * 1000,
            user: {
                name: "Anita Cruz",
                avatarUrl: "https://www.untitledui.com/images/avatars/anita-cruz?fm=webp&q=80",
                status: "online",
            },
            text: "Thank you for the quick turnaround. Looking now.",
        },
    ],
];

const chartData = [
    { A: 658, B: 448, C: 204, date: "2025-07-01T08:00:00.000Z" },
    { A: 662, B: 452, C: 205, date: "2025-07-01T13:41:23.713Z" },
    { A: 595, B: 385, C: 198, date: "2025-07-01T19:22:47.426Z" },
    { A: 625, B: 415, C: 201, date: "2025-07-02T01:04:11.139Z" },
    { A: 567, B: 357, C: 195, date: "2025-07-02T06:45:34.852Z" },
    { A: 665, B: 455, C: 205, date: "2025-07-02T12:26:58.565Z" },
    { A: 615, B: 405, C: 200, date: "2025-07-02T18:08:22.279Z" },
    { A: 595, B: 385, C: 198, date: "2025-07-02T23:49:45.992Z" },
    { A: 646, B: 436, C: 203, date: "2025-07-03T05:31:09.705Z" },
    { A: 568, B: 358, C: 195, date: "2025-07-03T11:12:33.418Z" },
    { A: 583, B: 373, C: 197, date: "2025-07-03T16:53:57.131Z" },
    { A: 665, B: 455, C: 205, date: "2025-07-03T22:35:20.844Z" },
    { A: 564, B: 354, C: 195, date: "2025-07-04T04:16:44.558Z" },
    { A: 575, B: 365, C: 196, date: "2025-07-04T09:58:08.271Z" },
    { A: 592, B: 382, C: 198, date: "2025-07-04T15:39:31.984Z" },
    { A: 641, B: 431, C: 203, date: "2025-07-04T21:20:55.697Z" },
    { A: 563, B: 353, C: 195, date: "2025-07-05T03:02:19.410Z" },
    { A: 480, B: 330, C: 187, date: "2025-07-05T08:43:43.124Z" },
    { A: 513, B: 303, C: 190, date: "2025-07-05T14:25:06.837Z" },
    { A: 531, B: 321, C: 192, date: "2025-07-05T20:06:30.550Z" },
    { A: 547, B: 337, C: 193, date: "2025-07-06T01:47:54.263Z" },
    { A: 569, B: 359, C: 195, date: "2025-07-06T07:29:17.976Z" },
    { A: 526, B: 316, C: 191, date: "2025-07-06T13:10:41.689Z" },
    { A: 541, B: 331, C: 193, date: "2025-07-06T18:52:05.403Z" },
    { A: 559, B: 349, C: 194, date: "2025-07-07T00:33:29.116Z" },
    { A: 514, B: 304, C: 190, date: "2025-07-07T06:14:52.829Z" },
    { A: 632, B: 422, C: 202, date: "2025-07-07T11:56:16.542Z" },
    { A: 662, B: 452, C: 205, date: "2025-07-07T17:37:40.255Z" },
    { A: 587, B: 377, C: 197, date: "2025-07-07T23:19:03.968Z" },
    { A: 628, B: 418, C: 201, date: "2025-07-08T05:00:27.682Z" },
    { A: 567, B: 357, C: 195, date: "2025-07-08T10:41:51.395Z" },
    { A: 616, B: 406, C: 200, date: "2025-07-08T16:23:15.108Z" },
    { A: 620, B: 410, C: 208, date: "2025-07-08T22:04:38.821Z" },
    { A: 568, B: 358, C: 202, date: "2025-07-09T03:46:02.534Z" },
    { A: 629, B: 419, C: 208, date: "2025-07-09T09:27:26.248Z" },
    { A: 605, B: 385, C: 211, date: "2025-07-09T15:08:49.961Z" },
    { A: 657, B: 437, C: 216, date: "2025-07-09T20:50:13.674Z" },
    { A: 777, B: 557, C: 228, date: "2025-07-10T02:31:37.387Z" },
    { A: 761, B: 541, C: 227, date: "2025-07-10T08:13:01.100Z" },
    { A: 714, B: 494, C: 222, date: "2025-07-10T13:54:24.813Z" },
    { A: 657, B: 437, C: 216, date: "2025-07-10T19:35:48.527Z" },
    { A: 606, B: 386, C: 211, date: "2025-07-11T01:17:12.240Z" },
    { A: 601, B: 381, C: 211, date: "2025-07-11T06:58:35.953Z" },
    { A: 622, B: 402, C: 213, date: "2025-07-11T12:39:59.666Z" },
    { A: 640, B: 420, C: 215, date: "2025-07-11T18:21:23.379Z" },
    { A: 692, B: 472, C: 220, date: "2025-07-12T00:02:47.093Z" },
    { A: 693, B: 473, C: 220, date: "2025-07-12T05:44:10.806Z" },
    { A: 615, B: 395, C: 212, date: "2025-07-12T11:25:34.519Z" },
    { A: 598, B: 378, C: 210, date: "2025-07-12T17:06:58.232Z" },
    { A: 770, B: 550, C: 228, date: "2025-07-12T22:48:21.945Z" },
    { A: 810, B: 590, C: 232, date: "2025-07-13T04:29:45.658Z" },
    { A: 756, B: 536, C: 226, date: "2025-07-13T10:11:09.372Z" },
    { A: 688, B: 468, C: 219, date: "2025-07-13T15:52:33.085Z" },
    { A: 719, B: 499, C: 222, date: "2025-07-13T21:33:56.798Z" },
    { A: 704, B: 484, C: 221, date: "2025-07-14T03:15:20.511Z" },
    { A: 750, B: 530, C: 226, date: "2025-07-14T08:56:44.224Z" },
    { A: 780, B: 560, C: 229, date: "2025-07-14T14:38:07.937Z" },
    { A: 775, B: 555, C: 228, date: "2025-07-14T20:19:31.651Z" },
    { A: 721, B: 501, C: 223, date: "2025-07-15T02:00:55.364Z" },
    { A: 625, B: 405, C: 213, date: "2025-07-15T07:42:19.077Z" },
    { A: 597, B: 377, C: 210, date: "2025-07-15T13:23:42.790Z" },
    { A: 651, B: 431, C: 216, date: "2025-07-15T19:05:06.503Z" },
    { A: 665, B: 445, C: 217, date: "2025-07-16T00:46:30.217Z" },
    { A: 586, B: 366, C: 209, date: "2025-07-16T06:27:53.930Z" },
    { A: 597, B: 377, C: 210, date: "2025-07-16T12:09:17.643Z" },
    { A: 621, B: 401, C: 213, date: "2025-07-16T17:50:41.356Z" },
    { A: 566, B: 346, C: 207, date: "2025-07-16T23:32:05.069Z" },
    { A: 575, B: 355, C: 208, date: "2025-07-17T05:13:28.782Z" },
    { A: 579, B: 359, C: 208, date: "2025-07-17T10:54:52.496Z" },
    { A: 507, B: 287, C: 201, date: "2025-07-17T16:36:16.209Z" },
    { A: 529, B: 309, C: 203, date: "2025-07-17T22:17:39.922Z" },
    { A: 565, B: 345, C: 207, date: "2025-07-18T03:59:03.635Z" },
    { A: 633, B: 413, C: 214, date: "2025-07-18T09:40:27.348Z" },
    { A: 700, B: 480, C: 221, date: "2025-07-18T15:21:51.062Z" },
    { A: 613, B: 393, C: 212, date: "2025-07-18T21:03:14.775Z" },
    { A: 553, B: 333, C: 206, date: "2025-07-19T02:44:38.488Z" },
    { A: 506, B: 276, C: 209, date: "2025-07-19T08:26:02.201Z" },
    { A: 539, B: 309, C: 212, date: "2025-07-19T14:07:25.914Z" },
    { A: 571, B: 341, C: 216, date: "2025-07-19T19:48:49.627Z" },
    { A: 615, B: 385, C: 220, date: "2025-07-20T01:30:13.341Z" },
    { A: 651, B: 421, C: 224, date: "2025-07-20T07:11:37.054Z" },
    { A: 723, B: 493, C: 231, date: "2025-07-20T12:53:00.767Z" },
    { A: 783, B: 553, C: 237, date: "2025-07-20T18:34:24.480Z" },
    { A: 824, B: 594, C: 241, date: "2025-07-21T00:15:48.193Z" },
    { A: 804, B: 574, C: 239, date: "2025-07-21T05:57:11.906Z" },
    { A: 852, B: 622, C: 244, date: "2025-07-21T11:38:35.620Z" },
    { A: 804, B: 574, C: 239, date: "2025-07-21T17:19:59.333Z" },
    { A: 789, B: 559, C: 237, date: "2025-07-21T23:01:23.046Z" },
    { A: 758, B: 528, C: 234, date: "2025-07-22T04:42:46.759Z" },
    { A: 763, B: 533, C: 235, date: "2025-07-22T10:24:10.472Z" },
    { A: 910, B: 680, C: 250, date: "2025-07-22T16:05:34.186Z" },
    { A: 791, B: 561, C: 238, date: "2025-07-22T21:46:57.899Z" },
    { A: 835, B: 605, C: 242, date: "2025-07-23T03:28:21.612Z" },
    { A: 733, B: 503, C: 232, date: "2025-07-23T09:09:45.325Z" },
    { A: 703, B: 473, C: 229, date: "2025-07-23T14:51:09.038Z" },
    { A: 772, B: 542, C: 236, date: "2025-07-23T20:32:32.751Z" },
    { A: 776, B: 546, C: 236, date: "2025-07-24T02:13:56.465Z" },
    { A: 708, B: 478, C: 229, date: "2025-07-24T07:55:20.178Z" },
    { A: 662, B: 432, C: 225, date: "2025-07-24T13:36:43.891Z" },
    { A: 705, B: 475, C: 229, date: "2025-07-24T19:18:07.604Z" },
    { A: 659, B: 429, C: 224, date: "2025-07-25T00:59:31.317Z" },
    { A: 673, B: 443, C: 226, date: "2025-07-25T06:40:55.031Z" },
    { A: 676, B: 446, C: 226, date: "2025-07-25T12:22:18.744Z" },
    { A: 635, B: 405, C: 222, date: "2025-07-25T18:03:42.457Z" },
    { A: 770, B: 540, C: 236, date: "2025-07-25T23:45:06.170Z" },
    { A: 810, B: 580, C: 240, date: "2025-07-26T05:26:29.883Z" },
    { A: 682, B: 452, C: 227, date: "2025-07-26T11:07:53.596Z" },
    { A: 694, B: 464, C: 228, date: "2025-07-26T16:49:17.310Z" },
    { A: 652, B: 422, C: 224, date: "2025-07-26T22:30:41.023Z" },
    { A: 706, B: 476, C: 229, date: "2025-07-27T04:12:04.736Z" },
    { A: 656, B: 426, C: 224, date: "2025-07-27T09:53:28.449Z" },
    { A: 649, B: 419, C: 223, date: "2025-07-27T15:34:52.162Z" },
    { A: 681, B: 451, C: 227, date: "2025-07-27T21:16:15.875Z" },
    { A: 735, B: 505, C: 232, date: "2025-07-28T02:57:39.589Z" },
    { A: 659, B: 429, C: 224, date: "2025-07-28T08:39:03.302Z" },
    { A: 638, B: 408, C: 222, date: "2025-07-28T14:20:27.015Z" },
    { A: 608, B: 378, C: 219, date: "2025-07-28T20:01:50.728Z" },
    { A: 567, B: 337, C: 215, date: "2025-07-29T01:43:14.441Z" },
    { A: 679, B: 449, C: 226, date: "2025-07-29T07:24:38.155Z" },
    { A: 704, B: 474, C: 229, date: "2025-07-29T13:06:01.868Z" },
    { A: 624, B: 394, C: 221, date: "2025-07-29T18:47:25.581Z" },
    { A: 683, B: 453, C: 227, date: "2025-07-30T00:28:49.294Z" },
    { A: 817, B: 587, C: 240, date: "2025-07-30T06:10:13.007Z" },
    { A: 882, B: 652, C: 247, date: "2025-07-30T11:51:36.720Z" },
    { A: 786, B: 556, C: 237, date: "2025-07-30T17:33:00.434Z" },
    { A: 755, B: 525, C: 234, date: "2025-07-30T23:14:24.147Z" },
    { A: 835, B: 605, C: 242, date: "2025-07-31T04:55:47.860Z" },
    { A: 791, B: 561, C: 238, date: "2025-07-31T10:37:11.573Z" },
    { A: 819, B: 589, C: 240, date: "2025-07-31T16:18:35.286Z" },
    { A: 868, B: 638, C: 245, date: "2025-07-31T21:59:59.000Z" },
];

export const Dashboard19 = () => {
    const isDesktop = useBreakpoint("lg");

    return (
        <div className="flex flex-col bg-primary lg:flex-row">
            <SidebarNavigationSlim
                activeUrl="/dashboard"
                items={[
                    {
                        label: "Home",
                        href: "/",
                        icon: HomeLine,
                    },
                    {
                        label: "Dashboard",
                        href: "/dashboard",
                        icon: BarChartSquare02,
                    },
                    {
                        label: "Projects",
                        href: "/projects",
                        icon: Rows01,
                    },
                    {
                        label: "Tasks",
                        href: "/tasks",
                        icon: CheckDone01,
                        badge: 8,
                    },
                    {
                        label: "Reporting",
                        href: "/reporting",
                        icon: PieChart03,
                    },
                    {
                        label: "Users",
                        href: "/users",
                        icon: Users01,
                    },
                ]}
            />
            <main className="flex w-full flex-col gap-8 pt-8 pb-12">
                {/* Page header */}
                <div className="px-4 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 border-b border-secondary pb-4 lg:flex-row">
                        <p className="text-xl font-semibold text-primary lg:text-display-xs">Stats for Olivia Rhye</p>
                        <div className="flex gap-3">
                            <Button size="md" color="secondary" iconLeading={<Dot size="md" className="mx-0.5 text-fg-success-secondary" />}>
                                Messages
                            </Button>
                            <Button size="md">Edit</Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 px-4 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 border-b border-secondary pb-5 lg:flex-row lg:items-center">
                        <p className="text-lg font-semibold text-primary">Profile views</p>
                        <ButtonGroup defaultSelectedKeys={["30-days"]}>
                            <ButtonGroupItem id="12-months">12 months</ButtonGroupItem>
                            <ButtonGroupItem id="30-days">30 days</ButtonGroupItem>
                            <ButtonGroupItem id="7-days">7 days</ButtonGroupItem>
                        </ButtonGroup>
                    </div>
                    <div className="flex h-60 flex-col">
                        <ResponsiveContainer height="100%">
                            <AreaChart
                                data={chartData}
                                className="text-tertiary [&_.recharts-text]:text-xs"
                                margin={{
                                    left: 5,
                                    right: 5,
                                    bottom: 8,
                                }}
                            >
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0.7" />
                                        <stop offset="95%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                <YAxis domain={[0, 1000]} hide={!isDesktop} fill="currentColor" interval="preserveStartEnd" axisLine={false} tickLine={false}>
                                    <Label
                                        value="Profile views"
                                        fill="currentColor"
                                        className="!text-xs font-medium"
                                        style={{ textAnchor: "middle" }}
                                        angle={-90}
                                        position="insideLeft"
                                    />
                                </YAxis>

                                <RechartsTooltip
                                    content={<ChartTooltipContent />}
                                    formatter={(value) => `${value} views`}
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleString(undefined, {
                                            // Format options for "1st July 23:12"
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })
                                    }
                                    cursor={{
                                        className: "stroke-utility-brand-600 stroke-2",
                                    }}
                                />

                                <Area
                                    isAnimationActive={false}
                                    className="text-utility-brand-600 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                    dataKey="A"
                                    name="Mobile"
                                    type="linear"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    fill="url(#gradient)"
                                    fillOpacity={0.1}
                                    activeDot={{
                                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                    }}
                                />

                                <Area
                                    isAnimationActive={false}
                                    className="text-utility-brand-400 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                    dataKey="B"
                                    name="Desktop"
                                    type="linear"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    fill="none"
                                    activeDot={{
                                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                    }}
                                />

                                <Area
                                    isAnimationActive={false}
                                    className="text-utility-brand-700 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                    dataKey="C"
                                    name="Tablet"
                                    type="linear"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    fill="none"
                                    activeDot={{
                                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                        <ul className="flex justify-between px-2 md:pr-6 lg:pl-21">
                            <li className="text-xs text-tertiary">3 Jul</li>
                            <li className="hidden text-xs text-tertiary md:block">7 Jul</li>
                            <li className="text-xs text-tertiary">1 Jul</li>
                            <li className="hidden text-xs text-tertiary md:block">15 Jul</li>
                            <li className="text-xs text-tertiary">19 Jul</li>
                            <li className="hidden text-xs text-tertiary md:block">23 Jul</li>
                            <li className="text-xs text-tertiary">27 Jul</li>
                            <li className="hidden text-xs text-tertiary md:block">31 Jul</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-8 px-4 md:flex-row md:flex-wrap lg:px-8">
                    <div className="flex flex-1 flex-col gap-2 md:min-w-[320px]">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <p className="text-lg font-semibold text-primary">Biggest fans</p>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Table aria-label="Biggest fans">
                                <Table.Header className="hidden">
                                    <Table.Head id="fan" isRowHeader className="w-full" />
                                    <Table.Head id="likes" />
                                    <Table.Head id="action" />
                                </Table.Header>
                                <Table.Body items={biggestFans} className="border-b border-secondary">
                                    {(item) => (
                                        <Table.Row id={item.id}>
                                            <Table.Cell className="w-full px-0">
                                                <div className="flex gap-3">
                                                    <Avatar size="md" src={item.avatarUrl} alt={item.name} />
                                                    <div>
                                                        <h1 className="text-sm font-medium text-primary">{item.name}</h1>
                                                        <p className="text-sm text-tertiary">{item.username}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-nowrap text-tertiary">{item.likes} likes</Table.Cell>
                                            <Table.Cell className="pr-0 pl-4">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <div className="flex justify-end">
                                <Button size="md" color="link-color">
                                    View all
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 md:min-w-[320px]">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <p className="text-lg font-semibold text-primary">Favorite designers</p>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Table aria-label="Favorite designers">
                                <Table.Header className="hidden">
                                    <Table.Head id="fan" isRowHeader className="w-full" />
                                    <Table.Head id="likes" />
                                    <Table.Head id="action" />
                                </Table.Header>
                                <Table.Body items={favoriteDesigners} className="border-b border-secondary">
                                    {(item) => (
                                        <Table.Row id={item.id}>
                                            <Table.Cell className="w-full px-0">
                                                <div className="flex gap-3">
                                                    <Avatar size="md" src={item.avatarUrl} alt={item.name} />
                                                    <div>
                                                        <h1 className="text-sm font-medium text-primary">{item.name}</h1>
                                                        <p className="text-sm text-tertiary">{item.username}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-nowrap text-tertiary">{item.likes} likes</Table.Cell>
                                            <Table.Cell className="pr-0 pl-4">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <div className="flex justify-end">
                                <Button size="md" color="link-color">
                                    View all
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="sticky top-0 hidden h-svh max-w-100 min-w-100 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle lg:flex">
                <div className="absolute inset-x-0 top-0 z-20 flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-4 py-5 backdrop-blur lg:px-6">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-primary">Anita Cruz</span>
                            <BadgeWithDot color="success" size="sm" type="modern">
                                Online
                            </BadgeWithDot>
                        </div>
                        <p className="text-sm text-tertiary">Auckland, New Zealand</p>
                    </div>
                    <Button size="md" color="tertiary" iconLeading={ArrowRight} />
                </div>
                <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto bg-primary px-4 py-6 pt-28 lg:px-6">
                    {messageGroups.map((messages, index) => (
                        <Fragment key={`${index}-fragment`}>
                            {index !== 0 && (
                                <ContentDivider type="single-line" className="py-2">
                                    <span className="text-sm font-medium text-tertiary">Today</span>
                                </ContentDivider>
                            )}
                            {messages.map((msg) => (
                                <MessageItem
                                    key={msg.id}
                                    msg={{
                                        ...msg,
                                        sentAt: formatRelativeTime(msg.sentAt),
                                    }}
                                    className="lg:max-w-78"
                                />
                            ))}
                        </Fragment>
                    ))}

                    {/* Typing status indicator */}
                    <div className="flex gap-3">
                        <Avatar src="https://www.untitledui.com/images/avatars/anita-cruz?fm=webp&q=80" alt="Anita Cruz" size="md" status="online" />
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-secondary">Anita Cruz</p>
                            <div className="inline-flex gap-1 rounded-lg rounded-tl-none bg-secondary p-2.5 text-md text-primary ring-1 ring-secondary ring-inset">
                                <div className="size-1 animate-bounce rounded-full bg-fg-tertiary [animation-delay:-0.3s]" />
                                <div className="size-1 animate-bounce rounded-full bg-fg-quaternary [animation-delay:-0.15s]" />
                                <div className="size-1 animate-bounce rounded-full bg-fg-tertiary" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 bg-primary px-6 pt-5 pb-6 ring-1 ring-secondary">
                    <Input placeholder="Message" size="md" />
                    <Button iconLeading={Send01} size="lg" />
                </div>
            </div>
        </div>
    );
};
