import SearchOverlay from '@/components/SearchOverlay';

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-zinc-50 dark:bg-black bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/map-placeholder.jpg)' }}
    >
      <SearchOverlay />
    </div>
  );
}