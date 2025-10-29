"use client";

import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import * as Headless from "@headlessui/react";
import { Text } from "@/components/text";

const variants = {
  info: {
    icon: InformationCircleIcon,
    styles: "bg-blue-50 border-blue-200 text-blue-800",
    iconStyles: "text-blue-500",
  },
  success: {
    icon: CheckCircleIcon,
    styles: "bg-green-50 border-green-200 text-green-800",
    iconStyles: "text-green-500",
  },
  error: {
    icon: ExclamationTriangleIcon,
    styles: "bg-red-50 border-red-200 text-red-800",
    iconStyles: "text-red-500",
  },
};

export function Alert({
  type,
  message,
}: {
  type: "info" | "success" | "error";
  message: string;
}) {
  const { icon: Icon, styles, iconStyles } = variants[type];

  return (
    <div
      className={clsx(
        "w-full p-4 border rounded-lg flex items-start space-x-3",
        styles,
      )}
    >
      <div className="flex-shrink-0">
        <Icon className={clsx("h-5 w-5", iconStyles)} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DialogTitleProps,
  "as" | "className"
>) {
  return (
    <Headless.DialogTitle
      {...props}
      className={clsx(
        className,
        "text-center text-base/6 font-semibold text-balance text-zinc-950 sm:text-left sm:text-sm/6 sm:text-wrap dark:text-white",
      )}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DescriptionProps<typeof Text>,
  "as" | "className"
>) {
  return (
    <Headless.Description
      as={Text}
      {...props}
      className={clsx(className, "mt-2 text-center text-pretty sm:text-left")}
    />
  );
}

export function AlertBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={clsx(className, "mt-4")} />;
}

export function AlertActions({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        "mt-6 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:mt-4 sm:flex-row sm:*:w-auto",
      )}
    />
  );
}
