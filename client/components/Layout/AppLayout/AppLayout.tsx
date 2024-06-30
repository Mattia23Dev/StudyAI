"use client"

import CustomSessionProvider from '@/components/Providers/AuthWrapper';
import Top from './Top';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	const pathname = usePathname();
	const [showChapters, setShowChapters] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
		  setShowChapters(pathname.startsWith('/map/'));
		}
	  }, [pathname]);
	return (
		<CustomSessionProvider>
			<div>
				<Top showChapters={showChapters} />
				<div>{children}</div>
			</div>
		</CustomSessionProvider>
	);
}
