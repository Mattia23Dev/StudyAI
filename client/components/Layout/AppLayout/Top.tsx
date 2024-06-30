'use client';

import IconComponent from '@/components/ui/Icon';
import Link from 'next/link';
import { Menu } from './Menu';
import useMapStore from '@/stores/mapStore';

  interface TopProps {
	showChapters: boolean;
  }
  interface Capitolo {
	chapter: string;
	structuredText: {
	  nodes: any[];
	  edges: any[];
	};
  } 
  const Top: React.FC<TopProps> = ({ showChapters }) => {
	const chapters = useMapStore((state) => state.chapters);
	const setElements = useMapStore((state) => state.setElements);

	const setChapt = (capitolo: Capitolo) => {
		console.log(capitolo)
		setElements(capitolo.structuredText.nodes, capitolo.structuredText.edges);
	}
	console.log(chapters)
	return (
		<div className='hidden md:block w-96 p-2 bg-white '>
			<div className='flex items-center gap-3'>
				<Link href='/' className='flex items-center space-x-2'>
					<IconComponent name='logo' className='w-4 h-4' />
					<span className='inline-block font-bold'>Mentalist</span>
				</Link>
				<div>
					<Menu />
				</div>
				<div className='flex items-center gap-3'>
				{showChapters && (
					chapters?.length > 0 && chapters?.map((chapter, index) => (
						<div key={index} onClick={() => setChapt(chapter)}>
						 <button>{chapter.chapter}</button>
						</div>						
					))
				)}
				</div>
			</div>
		</div>
	);
}
export default Top;

