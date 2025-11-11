import { useRef, useCallback, memo, useMemo } from 'react';
import { Container, Text } from '@react-three/uikit';
import VideoCard from './VideoCard';

// Видео для карусели - ВЫНЕСЕНО наружу чтобы не пересоздавать на каждый рендер
const CAROUSEL_VIDEOS = [
    {
      thumbnailUrl: '/images/1.webp',
      title: 'Tropical Paradise Experience',
      studio: 'Paradise Studios',
      timeAgo: '2d ago',
      likes: '24k likes',
      duration: '15:30'
    },
    {
      thumbnailUrl: '/images/2.webp',
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
      thumbnailUrl: '/images/4.webp',
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
      thumbnailUrl: '/images/6.webp',
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
      thumbnailUrl: '/images/8.webp',
      title: 'Ancient Ruins Discovery',
      studio: 'History VR',
      timeAgo: '2w ago',
      likes: '19k likes',
      duration: '16:40'
    },
    {
      thumbnailUrl: '/images/1.webp',
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
      thumbnailUrl: '/images/3.webp',
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
];

export default memo(function VideoCarousel({ settings, cardWidth, cardHeight }) {
  const scrollRef = useRef();

  // Блокируем вертикальный скролл через onScroll handler
  // useCallback чтобы не пересоздавать функцию на каждый рендер
  const handleScroll = useCallback((x, y) => {
    // Разрешаем только изменение X (горизонтальный скролл)
    // Блокируем Y (вертикальный скролл) возвращая false
    if (y !== 0) {
      return false; // Предотвращаем вертикальный скролл
    }
    // Разрешаем горизонтальный скролл
  }, []);

  // Скролл влево
  const scrollLeft = () => {
    if (scrollRef.current?.scrollPosition && cardWidth) {
      const currentX = scrollRef.current.scrollPosition.peek()[0];
      const scrollAmount = cardWidth + settings.gridCardGap;
      const newX = Math.max(0, currentX - scrollAmount);
      scrollRef.current.setScrollPosition(newX, 0);
    }
  };

  // Скролл вправо
  const scrollRight = () => {
    if (scrollRef.current?.scrollPosition && cardWidth) {
      const currentX = scrollRef.current.scrollPosition.peek()[0];
      const scrollAmount = cardWidth + settings.gridCardGap;
      scrollRef.current.setScrollPosition(currentX + scrollAmount, 0);
    }
  };

  return (
    <Container
      ref={scrollRef}
      width="100%"
      height={cardHeight || 320}
      flexShrink={0}
      flexDirection="row"
      gap={settings.gridCardGap}
      paddingLeft={settings.gridPaddingX}
      paddingRight={settings.gridPaddingX}
      overflow="scroll"
      scrollbarWidth={0}
      onScroll={handleScroll}
    >
      {CAROUSEL_VIDEOS.map((video, index) => (
        <Container
          key={index}
          flexShrink={0}
          width={cardWidth || '24%'}
        >
          <VideoCard
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
          />
        </Container>
      ))}
    </Container>
  );
});
