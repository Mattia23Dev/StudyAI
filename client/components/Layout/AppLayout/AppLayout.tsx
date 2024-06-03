import CustomSessionProvider from '@/components/Providers/AuthWrapper';
import Top from './Top';

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	return (
		<CustomSessionProvider>
			<div>
				<Top />
				<div>{children}</div>
			</div>
		</CustomSessionProvider>
	);
}
