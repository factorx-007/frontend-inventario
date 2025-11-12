'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Package, MapPin, Wrench, Users, Menu, X } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { 
      name: 'Inicio', 
      href: '/', 
      icon: <Home className="w-5 h-5" />,
      mobileOnly: true
    },
    { 
      name: 'Productos', 
      href: '/productos', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: 'Ubicaciones', 
      href: '/ubicacionEstante', 
      icon: <MapPin className="w-5 h-5" /> 
    },
    { 
      name: 'Préstamos', 
      href: '#', 
      icon: <Wrench className="w-5 h-5" />,
      subItems: [
        { name: 'Gestión de Préstamos', href: '/prestamosHerramientas' },
        { name: 'Reporte de Morosos', href: '/reporteMorosos' },
        { name: 'Gestión de Trabajadores', href: '/trabajadores' }
      ]
    },
  ];

  const isActive = (href: string) => {
    return pathname === href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  InventarioApp
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative" ref={item.subItems ? dropdownRef : null}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`${isActive(item.href)} group flex items-center px-3 py-2 rounded-md text-sm font-medium`}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.name}
                        <svg 
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'transform -rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown menu */}
                      {isDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${isActive(item.href)} group flex items-center px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                {!item.mobileOnly && (
                  <Link
                    href={item.href}
                    className={`${isActive(item.href)} group flex items-center px-3 py-2 rounded-md text-base font-medium`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
                {item.subItems && item.subItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className="block pl-14 pr-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
