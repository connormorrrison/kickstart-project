'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import Tile from "@/components/Tile";
import { Text4 } from "@/components/Text4";
import { Text5 } from "@/components/Text5";
import { ProfilePicture } from "@/components/ProfilePicture";
import { useStore } from "@/lib/store";

interface UserMenuProps {
  onSignOut: () => void;
  showDashboard?: boolean;
}

export default function UserMenu({ onSignOut, showDashboard = true }: UserMenuProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(192);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = document.querySelector('main .overflow-y-auto') || document.querySelector('main');
      if (scrollElement) {
        setIsScrolled(scrollElement.scrollTop > 0);
      }
    };

    const scrollElement = document.querySelector('main .overflow-y-auto') || document.querySelector('main');
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const measureWidth = () => {
      if (contentRef.current) {
        const textElement = contentRef.current.querySelector('.text-content') as HTMLElement;
        if (textElement) {
          const textWidth = textElement.offsetWidth;
          setExpandedWidth(40 + 12 + textWidth + 32);
        } else {
          setExpandedWidth(200);
        }
      }
    };

    setTimeout(measureWidth, 10);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!user) {
    return null;
  }

  const handleMenuItemClick = (action: () => void) => {
    setIsDropdownOpen(false);
    action();
  };

  return (
    <div className="relative h-16" ref={dropdownRef}>
      <div
        className={`h-full transition-[width] duration-300 ${isScrolled ? 'group' : ''}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.3, 1)',
          width: user ? (isScrolled ? '64px' : `${expandedWidth}px`) : '64px'
        }}
        onMouseEnter={(e) => {
          if (user && isScrolled) {
            (e.currentTarget as HTMLElement).style.width = `${expandedWidth}px`;
          }
        }}
        onMouseLeave={(e) => {
          if (user && isScrolled) {
            (e.currentTarget as HTMLElement).style.width = '64px';
          }
        }}
      >
        <div
          className="h-full w-full cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Tile className="h-full w-full overflow-hidden flex items-center justify-center p-0 px-4 py-4 bg-white hover:bg-gray-50 rounded-xl shadow-none border border-gray-200">
            <div ref={contentRef} className="flex items-center">
              <ProfilePicture size="md" className="shrink-0" />
              {user && (
                <div
                  className={`text-content flex flex-col overflow-hidden transition-all duration-200 ease-out ${
                    isScrolled ? 'w-0 opacity-0 ml-0 scale-95 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 group-hover:scale-100' : 'w-auto opacity-100 ml-3 scale-100'
                  }`}
                >
                  <Text5 className="whitespace-nowrap !text-gray-700">
                    {`${user.first_name} ${user.last_name}`}
                  </Text5>
                  <Text4 className="whitespace-nowrap !text-gray-500">
                    {user.email}
                  </Text4>
                </div>
              )}
            </div>
          </Tile>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="absolute top-full right-0 w-56 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          style={{ marginTop: '4px' }}
        >
          <Tile className="bg-white p-2 shadow-xl border border-gray-200 rounded-xl">
            <div className="flex flex-col gap-1">
              {showDashboard && (
                <button
                  onClick={() => handleMenuItemClick(() => router.push('/dashboard'))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-left"
                >
                  <LayoutDashboard size={18} className="text-gray-600" />
                  <span className="text-base font-normal text-gray-700">Dashboard</span>
                </button>
              )}
              <button
                onClick={() => handleMenuItemClick(() => router.push('/settings'))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-left"
              >
                <Settings size={18} className="text-gray-600" />
                <span className="text-base font-normal text-gray-700">Settings</span>
              </button>
              <button
                onClick={() => handleMenuItemClick(onSignOut)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-left"
              >
                <LogOut size={18} className="text-gray-600" />
                <span className="text-base font-normal text-gray-700">Log Out</span>
              </button>
            </div>
          </Tile>
        </div>
      )}
    </div>
  );
}
