"use client";

import { Title, Text, Avatar, Button, Popover } from "rizzui";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PiUserCircle } from "react-icons/pi";

import cn from "@utils/class-names";
import { routes } from "@/config/routes";
import { useTranslation } from "@/app/i18n/client";
import { hasPermission } from '@/helpers/auth';
import LanguageLink, { getClientLanguage } from "@/app/i18n/language-link";
import { changeAppLanguage } from "@/app/i18n/language-switcher";

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
  lang,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
  lang?: string;
}) {
  // TEMPORARILY DISABLED FOR ZANZIBAR OPEN ACCESS
  // The profile menu is hidden since authentication is disabled
  return null;
  
  /* ORIGINAL CODE - UNCOMMENT TO RE-ENABLE AUTHENTICATION
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>(getClientLanguage());

  useEffect(() => {
    const handleLanguageChange = ((event: CustomEvent) => {
      setCurrentLang(event.detail.language);
    }) as EventListener;

    window.addEventListener('i18n-language-changed', handleLanguageChange);
    return () => {
      window.removeEventListener('i18n-language-changed', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
          buttonClassName
        )}
      >
        <div className={cn("flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 sm:h-10 sm:w-10", avatarClassName)}>
          <PiUserCircle className="h-6 w-6 text-gray-600" />
        </div>
      </button>
    );
  }
  
  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName
          )}
        >
          <div className={cn("flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 sm:h-10 sm:w-10", avatarClassName)}>
            <PiUserCircle className="h-6 w-6 text-gray-600" />
          </div>
          {!!username && mounted && session?.user?.name && (
            <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">
              Hi, {session.user.name}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
  */
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = (session: any) => [
  ...(session?.user?.groups && hasPermission(session.user.groups, 'user', ["create", "read", "update", "delete"])
    ? [{
      name: "text-manage-users",
      href: routes.admin.users,
    }]
    : [])
];

function DropdownMenu() {
  const clientLang = getClientLanguage();
  const { t } = useTranslation(clientLang);
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const userMenuItems = menuItems(session);
  const [currentLang, setCurrentLang] = useState(clientLang);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLang(event.detail.language);
    };
    
    window.addEventListener('i18n-language-changed', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('i18n-language-changed', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    
    const lang = getClientLanguage();
    if (lang !== currentLang) {
      setCurrentLang(lang);
      changeAppLanguage(lang);
    }
  }, [currentLang]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
          <PiUserCircle className="h-6 w-6 text-gray-600" />
        </div>
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
            {session?.user?.name || ''}
          </Title>
          <Text className="text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap w-[96%]">
            {session?.user?.email || ''}
          </Text>
        </div>
      </div>
      {userMenuItems.length > 0 && mounted && (
        <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
          {userMenuItems.map((item) => (
            <LanguageLink
              key={item.name}
              href={item.href}
              className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
            >
              {t(item.name)}
            </LanguageLink>
          ))}
        </div>
      )}
      <div className={cn("border-t border-gray-300 px-6 pb-6 pt-5", !userMenuItems.length && "border-t-0")}>
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => signOut()}
        >
          {t('text-sign-out')}
        </Button>
      </div>
    </div>
  );
}
