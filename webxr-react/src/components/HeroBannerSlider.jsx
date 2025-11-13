import { useState, useEffect, memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Container, Image, Svg, Text } from '@react-three/uikit';
import { useOptimizedTexture } from '../hooks/useOptimizedTexture';

// Массив баннеров с контентом
const BANNERS = [
  {
    image: '/images/Banner/banner_1.webp',
    title: 'Discover Immersive Worlds',
    description: 'Experience breathtaking VR adventures like never before'
  },
  {
    image: '/images/Banner/banner_2.webp',
    title: 'Virtual Reality Reimagined',
    description: 'Step into stunning environments and interactive experiences'
  },
  {
    image: '/images/Banner/banner_3.webp',
    title: 'Your Gateway to VR',
    description: 'Explore premium content curated for true enthusiasts'
  },
];

// Компонент для одного баннера с анимацией через ref
const BannerSlide = memo(function BannerSlide({ src, borderRadius, slideRef }) {
  const texture = useOptimizedTexture(src);

  return (
    <Container
      ref={slideRef}
      positionType="absolute"
      positionLeft={0}
      positionTop={0}
      width="100%"
      height="100%"
      borderRadius={borderRadius}
      overflow="hidden"
      justifyContent="flex-start"
      alignItems="flex-start"
      backgroundColor="#000000"
    >
      {texture && (
        <Image
          src={texture}
          width="100%"
          aspectRatio={16/9}
          borderTopLeftRadius={borderRadius}
          borderTopRightRadius={borderRadius}
        />
      )}
    </Container>
  );
});

// Компонент Dot индикатора
const DotIndicator = memo(function DotIndicator({ isActive, onClick }) {
  return (
    <Container
      width={24}
      height={24}
      borderRadius={12}
      backgroundColor={isActive ? '#ff6b35' : '#555555'}
      cursor="pointer"
      onClick={onClick}
      flexShrink={0}
    />
  );
});

// Компонент стрелки навигации
const NavArrow = memo(function NavArrow({ direction, onClick }) {
  const iconSrc = direction === 'left'
    ? '/icons/Svg/arrow_left_icon.svg'
    : '/icons/Svg/arrow_right_icon.svg';

  return (
    <Container
      width={250}
      height={250}
      borderRadius={125}
      backgroundColor="black"
      backgroundOpacity={0.6}
      justifyContent="center"
      alignItems="center"
      cursor="pointer"
      onClick={onClick}
      flexShrink={0}
    >
      <Svg src={iconSrc} width={120} height={120} color="white" />
    </Container>
  );
});

export default memo(function HeroBannerSlider({ panelHeight, heightPercent = 50, borderRadius = 8, padding = 40, settings }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const prevSlideRef = useRef();
  const currentSlideRef = useRef();
  const prevTextRef = useRef();
  const currentTextRef = useRef();
  const fadeProgressRef = useRef(0);

  // Устанавливаем начальные opacity при монтировании и при старте анимации
  useEffect(() => {
    if (isAnimating) {
      // Начало анимации: prev видим, current скрыт
      if (prevSlideRef.current?.setProperties) {
        prevSlideRef.current.setProperties({ opacity: 1 });
      }
      if (currentSlideRef.current?.setProperties) {
        currentSlideRef.current.setProperties({ opacity: 0 });
      }
      if (prevTextRef.current?.setProperties) {
        prevTextRef.current.setProperties({ opacity: 1 });
      }
      if (currentTextRef.current?.setProperties) {
        currentTextRef.current.setProperties({ opacity: 0 });
      }
    } else {
      // Не анимируем: показываем только current
      if (prevSlideRef.current?.setProperties) {
        prevSlideRef.current.setProperties({ opacity: 0 });
      }
      if (currentSlideRef.current?.setProperties) {
        currentSlideRef.current.setProperties({ opacity: 1 });
      }
      if (prevTextRef.current?.setProperties) {
        prevTextRef.current.setProperties({ opacity: 0 });
      }
      if (currentTextRef.current?.setProperties) {
        currentTextRef.current.setProperties({ opacity: 1 });
      }
    }
  }, [isAnimating]);

  // Crossfade анимация через ref.setProperties() - БЕЗ React re-renders!
  useFrame((_, delta) => {
    if (!isAnimating) return;

    const speed = 2.5; // Скорость анимации

    // Плавное изменение от 0 до 1
    fadeProgressRef.current = Math.min(1, fadeProgressRef.current + delta * speed);

    const fadeOut = 1 - fadeProgressRef.current;
    const fadeIn = fadeProgressRef.current;

    // Обновляем opacity через setProperties() - плавная анимация!
    if (prevSlideRef.current?.setProperties) {
      prevSlideRef.current.setProperties({ opacity: fadeOut });
    }
    if (currentSlideRef.current?.setProperties) {
      currentSlideRef.current.setProperties({ opacity: fadeIn });
    }
    if (prevTextRef.current?.setProperties) {
      prevTextRef.current.setProperties({ opacity: fadeOut });
    }
    if (currentTextRef.current?.setProperties) {
      currentTextRef.current.setProperties({ opacity: fadeIn });
    }

    // Завершение анимации
    if (fadeProgressRef.current >= 1) {
      setIsAnimating(false);
      setPrevSlide(currentSlide);
      fadeProgressRef.current = 0;
    }
  });

  // Автоматическая ротация каждые 4 секунды
  useEffect(() => {
    if (isPaused || isAnimating) return;

    const interval = setInterval(() => {
      fadeProgressRef.current = 0;
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, isAnimating]);

  // Переключение слайдов
  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;

    fadeProgressRef.current = 0;
    setIsAnimating(true);
    setCurrentSlide(index);

    // Пауза на 8 секунд после ручного переключения
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const goToPrev = () => {
    const newIndex = (currentSlide - 1 + BANNERS.length) % BANNERS.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentSlide + 1) % BANNERS.length;
    goToSlide(newIndex);
  };

  // Высота баннера: heightPercent% от высоты панели
  // panelHeight в метрах, конвертируем в пиксели
  const bannerHeightInPixels = (panelHeight * (heightPercent / 100)) / 0.00035;

  return (
    <Container
      width="100%"
      height={bannerHeightInPixels}
      flexShrink={0}
      borderRadius={borderRadius}
      overflow="hidden"
    >
      {/* Предыдущий слайд (затухает) - всегда рендерим */}
      <BannerSlide
        slideRef={prevSlideRef}
        src={BANNERS[prevSlide].image}
        borderRadius={borderRadius}
      />

      {/* Текущий слайд (появляется) - всегда рендерим */}
      <BannerSlide
        slideRef={currentSlideRef}
        src={BANNERS[currentSlide].image}
        borderRadius={borderRadius}
      />

      {/* Градиент overlay сверху вниз */}
      <Image
        positionType="absolute"
        positionTop={0}
        positionLeft={0}
        src="/images/Banner/gradient.png"
        width="100%"
        height="100%"
        opacity={0.5}
        objectFit="fill"
        borderTopLeftRadius={borderRadius}
        borderTopRightRadius={borderRadius}
      />

      {/* Текстовый блок для предыдущего слайда (затухает) */}
      <Container
        ref={prevTextRef}
        positionType="absolute"
        positionLeft={padding}
        positionBottom={padding}
        flexDirection="column"
        gap={settings?.gridRowGap || 40}
        zIndex={10}
        maxWidth={(bannerHeightInPixels / 0.00035) * 0.5}
      >
        <Text
          fontSize={settings?.bannerTitleSize || 120}
          color="white"
          fontWeight={700}
        >
          {BANNERS[prevSlide].title}
        </Text>

        <Text
          fontSize={settings?.bannerDescriptionSize || 60}
          color="white"
          fontWeight={500}
        >
          {BANNERS[prevSlide].description}
        </Text>

        <Container
          height={250}
          paddingX={150}
          backgroundColor="white"
          borderRadius={125}
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          flexShrink={0}
          alignSelf="flex-start"
        >
          <Text fontSize={70} color="#222222" fontWeight={700}>
            Watch Now
          </Text>
        </Container>
      </Container>

      {/* Текстовый блок для текущего слайда (появляется) */}
      <Container
        ref={currentTextRef}
        positionType="absolute"
        positionLeft={padding}
        positionBottom={padding}
        flexDirection="column"
        gap={settings?.gridRowGap || 40}
        zIndex={10}
        maxWidth={(bannerHeightInPixels / 0.00035) * 0.5}
      >
        <Text
          fontSize={settings?.bannerTitleSize || 120}
          color="white"
          fontWeight={700}
        >
          {BANNERS[currentSlide].title}
        </Text>

        <Text
          fontSize={settings?.bannerDescriptionSize || 60}
          color="white"
          fontWeight={500}
        >
          {BANNERS[currentSlide].description}
        </Text>

        <Container
          height={250}
          paddingX={150}
          backgroundColor="white"
          borderRadius={125}
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          flexShrink={0}
          alignSelf="flex-start"
        >
          <Text fontSize={70} color="#222222" fontWeight={700}>
            Watch Now
          </Text>
        </Container>
      </Container>

      {/* Стрелки навигации - правый нижний угол */}
      <Container
        positionType="absolute"
        positionRight={padding}
        positionBottom={padding}
        flexDirection="row"
        gap={16}
        zIndex={10}
      >
        <NavArrow direction="left" onClick={goToPrev} />
        <NavArrow direction="right" onClick={goToNext} />
      </Container>

      {/* Dots индикаторы - скрыты */}
      {/* <Container
        positionType="absolute"
        positionBottom={padding}
        positionLeft={padding}
        flexDirection="row"
        gap={16}
        zIndex={10}
      >
        {BANNERS.map((_, index) => (
          <DotIndicator
            key={index}
            isActive={index === currentSlide}
            onClick={() => goToSlide(index)}
          />
        ))}
      </Container> */}
    </Container>
  );
});
