import { memo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Container, Text, Svg } from '@react-three/uikit';

const MENU_ITEMS = [
  { id: 'free', label: 'Free', icon: '/images/icons/free.svg' },
  { id: 'vr-videos', label: 'VR Videos', icon: '/images/icons/vr-videos.svg' },
  { id: 'interactive', label: 'Interactive', icon: '/images/icons/interactive.svg' },
  { id: 'vr-cams', label: 'VR Cams', icon: '/images/icons/vr-cams.svg' },
  { id: 'liked', label: 'Liked', icon: '/images/icons/liked.svg' },
  { id: 'following', label: 'Following', icon: '/images/icons/following.svg' },
];

export default memo(function NavigationMenu({
  activePage = 'free',
  onPageChange,
  settings,
}) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [currentWidth, setCurrentWidth] = useState(200);
  const widthRef = useRef(200);

  const collapsedWidth = 200;
  const expandedWidth = 800;
  const buttonHeight = 200;
  const gap = 20;
  const padding = 40;

  // Анимированная ширина через useFrame
  const targetWidth = open ? expandedWidth : collapsedWidth;

  useFrame((_, dt) => {
    const speed = 8;
    widthRef.current += (targetWidth - widthRef.current) * Math.min(1, speed * dt);
    setCurrentWidth(widthRef.current);
  });

  // Hover - открываем сразу
  const handlePointerEnter = () => {
    setOpen(true);
  };

  const handlePointerLeave = () => {
    setOpen(false);
    setHoveredItem(null);
  };

  // Коэффициент открытия (0..1)
  const openFrac = Math.min(
    1,
    Math.max(0, (currentWidth - collapsedWidth) / (expandedWidth - collapsedWidth))
  );

  // Максимальная ширина для подписи
  const labelMaxWidth = expandedWidth - collapsedWidth - gap;

  // Динамический border radius: 140 (круглый) когда закрыто, settings.panelBorderRadius когда открыто
  const buttonBorderRadius = 130 - (130 - settings.panelBorderRadius) * openFrac;
  const containerBorderRadius = 130 - (130 - settings.panelBorderRadius) * openFrac;

  console.log('Menu render:', { open, currentWidth, openFrac });

  return (
    // Внешний контейнер - вертикальное центрирование
    <Container
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      {/* Белый контейнер с анимированной шириной */}
      <Container
        width={currentWidth + padding * 2}
        flexDirection="column"
        alignItems="flex-start"
        gap={gap}
        padding={padding}
        backgroundColor="white"
        borderRadius={containerBorderRadius}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <Container
              key={item.id}
              width={currentWidth}
              height={buttonHeight}
              flexDirection="row"
              alignItems="center"
              justifyContent="flex-start"
              gap={gap}
              backgroundColor={isActive ? '#ff6b35' : (isHovered ? '#333333' : '#111111')}
              borderRadius={buttonBorderRadius}
              cursor="pointer"
              onClick={() => onPageChange?.(item.id)}
              onPointerEnter={() => setHoveredItem(item.id)}
              onPointerLeave={() => setHoveredItem(null)}
            >
              {/* Иконка */}
              <Container
                width={collapsedWidth}
                height={buttonHeight}
                justifyContent="center"
                alignItems="center"
                flexShrink={0}
              >
                <Svg
                  src={item.icon}
                  width={120}
                  height={120}
                  color={isActive ? '#FFFFFF' : '#B0B0B0'}
                />
              </Container>

              {/* Подпись - выезжает */}
              <Container
                height={buttonHeight}
                width={labelMaxWidth * openFrac}
                overflow="hidden"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                flexShrink={0}
              >
                <Text
                  fontSize={80}
                  color="white"
                  fontWeight={isActive ? 700 : 500}
                  whiteSpace="pre"
                  wordBreak="keep-all"
                  flexShrink={0}
                >
                  {item.label}
                </Text>
              </Container>
            </Container>
          );
        })}
      </Container>
    </Container>
  );
});
