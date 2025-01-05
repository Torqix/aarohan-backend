'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Create Event', href: '/admin/events/create' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-vercel-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link
                  href="/"
                  className="flex flex-shrink-0 items-center"
                >
                  <span className="text-xl font-bold text-white hover:opacity-90 transition-opacity">
                    AarohanR
                  </span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center h-16 px-1 text-sm font-medium transition-colors border-b-2',
                        pathname === item.href
                          ? 'text-white border-vercel-blue'
                          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {user?.role === 'admin' && adminNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center h-16 px-1 text-sm font-medium transition-colors border-b-2',
                        pathname === item.href
                          ? 'text-white border-vercel-blue'
                          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center gap-2 rounded-md bg-vercel-gray-900 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-vercel-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-vercel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                      <span>{user.email}</span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-vercel-gray-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={cn(
                                active ? 'bg-vercel-gray-800' : '',
                                'block w-full px-4 py-2 text-sm text-gray-300 text-left hover:text-white'
                              )}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="rounded-md bg-vercel-blue px-4 py-2 text-sm font-medium text-white hover:bg-vercel-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-vercel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-vercel-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-vercel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <FiX className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <FiMenu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.href}
                  as={Link}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-vercel-gray-800 text-white'
                      : 'text-gray-400 hover:bg-vercel-gray-800 hover:text-white'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {user?.role === 'admin' && adminNavigation.map((item) => (
                <Disclosure.Button
                  key={item.href}
                  as={Link}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-vercel-gray-800 text-white'
                      : 'text-gray-400 hover:bg-vercel-gray-800 hover:text-white'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-vercel-gray-800 pb-3 pt-4">
              {user ? (
                <div className="space-y-1 px-4">
                  <p className="text-base font-medium text-white">{user.email}</p>
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block w-full px-4 py-2 text-base font-medium text-gray-400 hover:bg-vercel-gray-800 hover:text-white text-left"
                  >
                    Sign Out
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="px-4">
                  <Link
                    href="/auth/signin"
                    className="block rounded-md bg-vercel-blue px-4 py-2 text-base font-medium text-white hover:bg-vercel-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-vercel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 