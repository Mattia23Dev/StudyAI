import CustomSessionProvider from '@/components/Providers/SessionProvider';
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
