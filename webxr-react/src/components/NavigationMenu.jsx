import { memo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Container, Text, Svg } from '@react-three/uikit';

const MENU_ITEMS = [
  { id: 'for-you', label: 'For you', icon: `${import.meta.env.BASE_URL}icons/Svg/for_you_icon.svg` },
  { id: 'all-vr-videos', label: 'All VR videos', icon: `${import.meta.env.BASE_URL}icons/Svg/vr-videos.svg` },
  { id: 'passthrough', label: 'Passthrough', icon: `${import.meta.env.BASE_URL}icons/Svg/passthrough.svg` },
  { id: 'slr-originals', label: 'SLR Originals', icon: `${import.meta.env.BASE_URL}icons/Svg/slr-originals.svg` },
  { id: 'interactive', label: 'Interactive', icon: `${import.meta.env.BASE_URL}icons/Svg/interactive.svg` },
  { id: 'vr-cams', label: 'VR Cams', icon: `${import.meta.env.BASE_URL}icons/Svg/vr-cams.svg` },
  { id: 'free', label: 'Free', icon: `${import.meta.env.BASE_URL}icons/Svg/free.svg` },
];

export default memo(function NavigationMenu({
  activePage = 'for-you',
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

  // Динамический border radius: 100 (идеальный круг) когда закрыто, settings.panelBorderRadius когда открыто
  const buttonBorderRadius = 100 - (100 - settings.panelBorderRadius) * openFrac;
  const containerBorderRadius = 100 - (100 - settings.panelBorderRadius) * openFrac;

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
      {/* Контейнер с анимированной шириной */}
      <Container
        width={currentWidth + padding * 2}
        flexDirection="column"
        alignItems="flex-start"
        gap={gap}
        padding={padding}
        backgroundColor="#222222"
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
              backgroundColor={isActive ? '#ff6b35' : (isHovered ? '#333333' : '#222222')}
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
