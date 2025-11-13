import { memo, useState } from 'react';
import { Container, Svg } from '@react-three/uikit';

const MENU_ITEMS = [
  { id: 'home', icon: `${import.meta.env.BASE_URL}icons/Svg/home_icon.svg` },
  { id: 'add-toy', icon: `${import.meta.env.BASE_URL}icons/Svg/add_toy_icon.svg` },
  { id: 'search', icon: `${import.meta.env.BASE_URL}icons/Svg/search_icon.svg` },
  { id: 'profile', icon: `${import.meta.env.BASE_URL}icons/Svg/profile_icon.svg` },
];

export default memo(function FooterMenu({
  activeItem = 'home',
  onItemChange,
  debugPanelOpen = false,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const buttonSize = 200;
  const gap = 20;
  const padding = 40;
  const iconSize = 110;

  return (
    <Container
      width="100%"
      height="100%"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
    >
      {/* Контейнер с кнопками */}
      <Container
        flexDirection="row"
        alignItems="center"
        gap={gap}
        padding={padding}
        backgroundColor="#222222"
        borderRadius={130}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = item.id === 'profile' ? debugPanelOpen : activeItem === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <Container
              key={item.id}
              width={buttonSize}
              height={buttonSize}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              backgroundColor={isActive ? '#ff6b35' : (isHovered ? '#333333' : '#222222')}
              borderRadius={100}
              cursor="pointer"
              onClick={() => onItemChange?.(item.id)}
              onPointerEnter={() => setHoveredItem(item.id)}
              onPointerLeave={() => setHoveredItem(null)}
            >
              <Svg
                src={item.icon}
                width={iconSize}
                height={iconSize}
                color="white"
              />
            </Container>
          );
        })}
      </Container>
    </Container>
  );
});
