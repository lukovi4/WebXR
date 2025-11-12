import { useCallback, memo } from 'react';
import { Container } from '@react-three/uikit';
import VideoCard from './VideoCard';

export default memo(function VideoGrid({ settings, onCardSizeMeasured }) {
  // Callback для получения размеров от первой карточки
  const handleFirstCardSize = useCallback((width, height) => {
    onCardSizeMeasured?.(width, height);
  }, [onCardSizeMeasured]);


  // Массив видео данных (16 карточек для 4×4 грида)
  const videos = [
    {
      thumbnailUrl: '/images/1.webp',
      title: 'Tropical Paradise Experience',
      studio: 'Paradise Studios',
      timeAgo: '2d ago',
      likes: '24k likes',
      duration: '15:30'
    },
    {
      thumbnailUrl: '/images/12.webp',
      title: 'Mountain Adventure VR',
      studio: 'Nature VR',
      timeAgo: '5d ago',
      likes: '18k likes',
      duration: '22:45'
    },
    {
      thumbnailUrl: '/images/3.webp',
      title: 'Ocean Depths Exploration',
      studio: 'Deep Blue',
      timeAgo: '1w ago',
      likes: '32k likes',
      duration: '18:20'
    },
    {
      thumbnailUrl: '/images/14.webp',
      title: 'Desert Sunset Journey',
      studio: 'Wanderlust VR',
      timeAgo: '3d ago',
      likes: '15k likes',
      duration: '12:15'
    },
    {
      thumbnailUrl: '/images/5.webp',
      title: 'Urban Night Life',
      studio: 'City Vibes',
      timeAgo: '1d ago',
      likes: '41k likes',
      duration: '25:50'
    },
    {
      thumbnailUrl: '/images/9.webp',
      title: 'Forest Meditation',
      studio: 'Zen Studios',
      timeAgo: '4d ago',
      likes: '28k likes',
      duration: '30:00'
    },
    {
      thumbnailUrl: '/images/7.webp',
      title: 'Space Station Tour',
      studio: 'Cosmic VR',
      timeAgo: '6d ago',
      likes: '56k likes',
      duration: '20:35'
    },
    {
      thumbnailUrl: '/images/11.webp',
      title: 'Ancient Ruins Discovery',
      studio: 'History VR',
      timeAgo: '2w ago',
      likes: '19k likes',
      duration: '16:40'
    },
    {
      thumbnailUrl: '/images/15.webp',
      title: 'Beach Relaxation 360°',
      studio: 'Paradise Studios',
      timeAgo: '1w ago',
      likes: '22k likes',
      duration: '14:20'
    },
    {
      thumbnailUrl: '/images/2.webp',
      title: 'Alpine Summit Climb',
      studio: 'Nature VR',
      timeAgo: '3d ago',
      likes: '16k likes',
      duration: '19:10'
    },
    {
      thumbnailUrl: '/images/13.webp',
      title: 'Underwater Coral Reef',
      studio: 'Deep Blue',
      timeAgo: '5d ago',
      likes: '29k likes',
      duration: '21:30'
    },
    {
      thumbnailUrl: '/images/4.webp',
      title: 'Sahara Desert Night',
      studio: 'Wanderlust VR',
      timeAgo: '1d ago',
      likes: '13k likes',
      duration: '17:45'
    },
    {
      thumbnailUrl: '/images/10.webp',
      title: 'Tokyo Neon Dreams',
      studio: 'City Vibes',
      timeAgo: '2d ago',
      likes: '38k likes',
      duration: '23:15'
    },
    {
      thumbnailUrl: '/images/6.webp',
      title: 'Rainforest Sanctuary',
      studio: 'Zen Studios',
      timeAgo: '6d ago',
      likes: '25k likes',
      duration: '28:50'
    },
    {
      thumbnailUrl: '/images/8.webp',
      title: 'Mars Colony Preview',
      studio: 'Cosmic VR',
      timeAgo: '4d ago',
      likes: '51k likes',
      duration: '24:20'
    },
    {
      thumbnailUrl: '/images/1.webp',
      title: 'Mayan Temple Expedition',
      studio: 'History VR',
      timeAgo: '1w ago',
      likes: '17k likes',
      duration: '19:55'
    },
  ];

  return (
    <Container
      width="100%"
      flexShrink={0}
      paddingX={settings.gridPaddingX}
      flexDirection="column"
    >
      {/* 4 ряда */}
      {[0, 1, 2, 3].map((rowIndex) => (
        <Container
          key={rowIndex}
          flexDirection="row"
          flexShrink={0}
          gap={settings.gridCardGap} // Отступы между карточками
          width="100%"
          marginBottom={rowIndex < 3 ? settings.gridRowGap : settings.gridRowGap + 20} // Отступ между рядами, увеличенный для последнего
        >
          {/* 4 карточки в ряд */}
          {[0, 1, 2, 3].map((colIndex) => {
            const videoIndex = rowIndex * 4 + colIndex;
            const video = videos[videoIndex];
            const isFirstCard = rowIndex === 0 && colIndex === 0;
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
