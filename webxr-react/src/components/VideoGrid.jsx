import { useCallback, memo } from 'react';
import { Container } from '@react-three/uikit';
import VideoCard from './VideoCard';

export default memo(function VideoGrid({ settings, onCardSizeMeasured, maxVideos, columns = 4 }) {
  // Callback для получения размеров от первой карточки
  const handleFirstCardSize = useCallback((width, height) => {
    onCardSizeMeasured?.(width, height);
  }, [onCardSizeMeasured]);


  // Массив видео данных (46 карточек для полного каталога)
  const videos = [
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/1.webp`,
      title: 'Tropical Paradise Experience',
      studio: 'Paradise Studios',
      timeAgo: '2d ago',
      likes: '24k likes',
      duration: '15:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/12.webp`,
      title: 'Mountain Adventure VR',
      studio: 'Nature VR',
      timeAgo: '5d ago',
      likes: '18k likes',
      duration: '22:45'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/3.webp`,
      title: 'Ocean Depths Exploration',
      studio: 'Deep Blue',
      timeAgo: '1w ago',
      likes: '32k likes',
      duration: '18:20'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/14.webp`,
      title: 'Desert Sunset Journey',
      studio: 'Wanderlust VR',
      timeAgo: '3d ago',
      likes: '15k likes',
      duration: '12:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/5.webp`,
      title: 'Urban Night Life',
      studio: 'City Vibes',
      timeAgo: '1d ago',
      likes: '41k likes',
      duration: '25:50'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/9.webp`,
      title: 'Forest Meditation',
      studio: 'Zen Studios',
      timeAgo: '4d ago',
      likes: '28k likes',
      duration: '30:00'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/7.webp`,
      title: 'Space Station Tour',
      studio: 'Cosmic VR',
      timeAgo: '6d ago',
      likes: '56k likes',
      duration: '20:35'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/11.webp`,
      title: 'Ancient Ruins Discovery',
      studio: 'History VR',
      timeAgo: '2w ago',
      likes: '19k likes',
      duration: '16:40'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/15.webp`,
      title: 'Beach Relaxation 360°',
      studio: 'Paradise Studios',
      timeAgo: '1w ago',
      likes: '22k likes',
      duration: '14:20'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/2.webp`,
      title: 'Alpine Summit Climb',
      studio: 'Nature VR',
      timeAgo: '3d ago',
      likes: '16k likes',
      duration: '19:10'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/13.webp`,
      title: 'Underwater Coral Reef',
      studio: 'Deep Blue',
      timeAgo: '5d ago',
      likes: '29k likes',
      duration: '21:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/4.webp`,
      title: 'Sahara Desert Night',
      studio: 'Wanderlust VR',
      timeAgo: '1d ago',
      likes: '13k likes',
      duration: '17:45'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/10.webp`,
      title: 'Tokyo Neon Dreams',
      studio: 'City Vibes',
      timeAgo: '2d ago',
      likes: '38k likes',
      duration: '23:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/6.webp`,
      title: 'Rainforest Sanctuary',
      studio: 'Zen Studios',
      timeAgo: '6d ago',
      likes: '25k likes',
      duration: '28:50'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/8.webp`,
      title: 'Mars Colony Preview',
      studio: 'Cosmic VR',
      timeAgo: '4d ago',
      likes: '51k likes',
      duration: '24:20'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/1.webp`,
      title: 'Mayan Temple Expedition',
      studio: 'History VR',
      timeAgo: '1w ago',
      likes: '17k likes',
      duration: '19:55'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/5.webp`,
      title: 'Rooftop Sunset Views',
      studio: 'City Vibes',
      timeAgo: '3d ago',
      likes: '33k likes',
      duration: '16:25'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/7.webp`,
      title: 'Zero Gravity Experience',
      studio: 'Cosmic VR',
      timeAgo: '1w ago',
      likes: '44k likes',
      duration: '18:40'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/3.webp`,
      title: 'Caribbean Diving Adventure',
      studio: 'Deep Blue',
      timeAgo: '4d ago',
      likes: '27k likes',
      duration: '20:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/9.webp`,
      title: 'Zen Garden Retreat',
      studio: 'Zen Studios',
      timeAgo: '5d ago',
      likes: '21k likes',
      duration: '26:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/12.webp`,
      title: 'Himalayan Trek 360',
      studio: 'Nature VR',
      timeAgo: '2d ago',
      likes: '19k likes',
      duration: '24:10'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/14.webp`,
      title: 'Arabian Nights Experience',
      studio: 'Wanderlust VR',
      timeAgo: '6d ago',
      likes: '14k likes',
      duration: '15:55'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/1.webp`,
      title: 'Private Island Getaway',
      studio: 'Paradise Studios',
      timeAgo: '1d ago',
      likes: '36k likes',
      duration: '17:20'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/15.webp`,
      title: 'Coastal Sunrise Yoga',
      studio: 'Paradise Studios',
      timeAgo: '3d ago',
      likes: '23k likes',
      duration: '22:00'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/10.webp`,
      title: 'Seoul Street Food Tour',
      studio: 'City Vibes',
      timeAgo: '5d ago',
      likes: '31k likes',
      duration: '19:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/6.webp`,
      title: 'Amazon Jungle Expedition',
      studio: 'Zen Studios',
      timeAgo: '1w ago',
      likes: '26k likes',
      duration: '27:45'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/8.webp`,
      title: 'International Space Station',
      studio: 'Cosmic VR',
      timeAgo: '2d ago',
      likes: '48k likes',
      duration: '21:50'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/11.webp`,
      title: 'Egyptian Pyramids Tour',
      studio: 'History VR',
      timeAgo: '4d ago',
      likes: '20k likes',
      duration: '18:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/2.webp`,
      title: 'Norwegian Fjords Journey',
      studio: 'Nature VR',
      timeAgo: '6d ago',
      likes: '17k likes',
      duration: '23:40'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/13.webp`,
      title: 'Great Barrier Reef Dive',
      studio: 'Deep Blue',
      timeAgo: '1d ago',
      likes: '34k likes',
      duration: '19:25'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/4.webp`,
      title: 'Morocco Desert Safari',
      studio: 'Wanderlust VR',
      timeAgo: '3d ago',
      likes: '16k likes',
      duration: '20:05'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/7.webp`,
      title: 'Lunar Surface Exploration',
      studio: 'Cosmic VR',
      timeAgo: '5d ago',
      likes: '52k likes',
      duration: '22:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/9.webp`,
      title: 'Bamboo Forest Serenity',
      studio: 'Zen Studios',
      timeAgo: '2d ago',
      likes: '24k likes',
      duration: '29:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/1.webp`,
      title: 'Fiji Islands Paradise',
      studio: 'Paradise Studios',
      timeAgo: '4d ago',
      likes: '28k likes',
      duration: '16:50'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/12.webp`,
      title: 'Rocky Mountains Winter',
      studio: 'Nature VR',
      timeAgo: '1w ago',
      likes: '15k likes',
      duration: '21:20'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/10.webp`,
      title: 'Hong Kong Night Lights',
      studio: 'City Vibes',
      timeAgo: '3d ago',
      likes: '40k likes',
      duration: '18:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/3.webp`,
      title: 'Maldives Underwater Villa',
      studio: 'Deep Blue',
      timeAgo: '5d ago',
      likes: '30k likes',
      duration: '17:35'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/15.webp`,
      title: 'Bali Beach Sunset',
      studio: 'Paradise Studios',
      timeAgo: '6d ago',
      likes: '25k likes',
      duration: '14:45'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/14.webp`,
      title: 'Dubai Desert Luxury',
      studio: 'Wanderlust VR',
      timeAgo: '1d ago',
      likes: '18k likes',
      duration: '15:30'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/8.webp`,
      title: 'Saturn Rings Flyby',
      studio: 'Cosmic VR',
      timeAgo: '2d ago',
      likes: '55k likes',
      duration: '23:25'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/11.webp`,
      title: 'Roman Colosseum Virtual',
      studio: 'History VR',
      timeAgo: '4d ago',
      likes: '21k likes',
      duration: '17:15'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/6.webp`,
      title: 'Costa Rica Wildlife Tour',
      studio: 'Zen Studios',
      timeAgo: '3d ago',
      likes: '27k likes',
      duration: '28:00'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/13.webp`,
      title: 'Deep Sea Creatures',
      studio: 'Deep Blue',
      timeAgo: '5d ago',
      likes: '32k likes',
      duration: '20:50'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/2.webp`,
      title: 'Swiss Alps Paragliding',
      studio: 'Nature VR',
      timeAgo: '1w ago',
      likes: '19k likes',
      duration: '22:35'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/4.webp`,
      title: 'Petra Ancient City',
      studio: 'Wanderlust VR',
      timeAgo: '2d ago',
      likes: '16k likes',
      duration: '19:40'
    },
    {
      thumbnailUrl: `${import.meta.env.BASE_URL}images/5.webp`,
      title: 'New York Skyline Night',
      studio: 'City Vibes',
      timeAgo: '6d ago',
      likes: '42k likes',
      duration: '24:55'
    },
  ];

  // Ограничиваем количество видео
  const displayedVideos = maxVideos ? videos.slice(0, maxVideos) : videos;
  const numRows = Math.ceil(displayedVideos.length / columns);

  return (
    <Container
      width="100%"
      flexShrink={0}
      paddingX={settings.gridPaddingX}
      flexDirection="column"
    >
      {/* Динамическое количество рядов */}
      {Array.from({ length: numRows }).map((_, rowIndex) => (
        <Container
          key={rowIndex}
          flexDirection="row"
          flexShrink={0}
          gap={settings.gridCardGap}
          width="100%"
          marginBottom={rowIndex < numRows - 1 ? settings.gridRowGap : 0}
        >
          {/* Динамическое количество колонок */}
          {Array.from({ length: columns }).map((_, colIndex) => {
            const videoIndex = rowIndex * columns + colIndex;
            const video = displayedVideos[videoIndex];
            const isFirstCard = rowIndex === 0 && colIndex === 0;

            // Если видео нет (неполный ряд), рендерим пустой контейнер
            if (!video) {
              return (
                <Container
                  key={colIndex}
                  flexGrow={1}
                  flexBasis={0}
                />
              );
            }

            return (
              <Container
                key={colIndex}
                flexGrow={1}
                flexBasis={0}
              >
                <VideoCard
                  onSizeMeasured={isFirstCard ? handleFirstCardSize : undefined}
                  thumbnailUrl={video.thumbnailUrl}
                  title={video.title}
                  studio={video.studio}
                  timeAgo={video.timeAgo}
                  likes={video.likes}
                  duration={video.duration}
                  cardTitleSize={settings.cardTitleSize}
                  cardDescriptionSize={settings.cardDescriptionSize}
                  cardDurationSize={settings.cardDurationSize}
                  cardPreviewTitleGap={settings.cardPreviewTitleGap}
                  cardTitleDescriptionGap={settings.cardTitleDescriptionGap}
                  cardImageBorderRadius={settings.cardImageBorderRadius}
                  gridPaddingX={settings.gridPaddingX}
                  gridCardGap={settings.gridCardGap}
                  panelWidth={settings.panelWidth}
                  panelHeight={settings.panelHeight}
                />
              </Container>
            );
          })}
        </Container>
      ))}
    </Container>
  );
});
