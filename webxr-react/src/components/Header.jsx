import { memo } from 'react';
import { Container, Image, Text } from '@react-three/uikit';

export default memo(function Header({
  height = 250,
  paddingX = 40,
  logoHeight = 200,
}) {
  return (
    <Container
      width="100%"
      height={height}
      flexShrink={0}
      flexDirection="row"
      alignItems="center"
      paddingX={paddingX}
      gap={100}
    >
      {/* Логотип слева */}
      <Container
        height={logoHeight}
        aspectRatio={580 / 136}
        flexShrink={0}
      >
        <Image
          src="/images/logo.png"
          width="100%"
          height="100%"
        />
      </Container>

      {/* Spacer для выравнивания */}
      <Container flexGrow={1} />

      {/* Поиск по центру */}
      <Container
        height={200}
        width={2000}
        flexShrink={0}
        backgroundColor="#222222"
        borderRadius={100}
        flexDirection="row"
        alignItems="center"
        paddingX={80}
        gap={50}
      >
        <Text fontSize={80} color="#999999">
          🔍
        </Text>
        <Text fontSize={70} color="#999999" fontWeight={500}>
          Search videos...
        </Text>
      </Container>

      {/* Spacer для выравнивания */}
      <Container flexGrow={1} />

      {/* Кнопка Sign In справа */}
      <Container
        height={200}
        paddingX={120}
        flexShrink={0}
        backgroundColor="#ff6b35"
        borderRadius={100}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
      >
        <Text fontSize={70} color="white" fontWeight={700}>
          Sign In
        </Text>
      </Container>
    </Container>
  );
});
