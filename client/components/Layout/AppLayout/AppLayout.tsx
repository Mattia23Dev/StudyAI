"use client"

import CustomSessionProvider from '@/components/Providers/AuthWrapper';
import Top from './Top';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	const pathname = usePathname();
	const showChapters = (pathname ?? '').startsWith('/map/');
	return (
		<CustomSessionProvider>
			<div>
				<Top showChapters={showChapters} />
				<div>{children}</div>
			</div>
		</CustomSessionProvider>
	);
}
